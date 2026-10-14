import {NextRequest} from "next/server";
import {db} from "@/lib/forge/db";
import {authorize,fail,json} from "@/lib/forge/response";
import {audit} from "@/lib/forge/security";

type Context={params:Promise<{id:string}>};
type Kind="tenders"|"quotes"|"projects";
type Action="add_requirement"|"toggle_requirement"|"add_line"|"remove_line"|"add_milestone"|"toggle_milestone"|"add_note"|"handover";
const str=(v:unknown,n=180)=>String(v??"").trim().slice(0,n);
async function lookup(id:string,org:string){
 const rows=await db()`SELECT id,kind,title,client,owner,status,amount,target_date FROM crm_records WHERE id=${id} AND organization_id=${org} LIMIT 1`;
 return rows[0]??null;
}
export async function GET(request:NextRequest,{params}:Context){
 const auth=await authorize(request);if("response" in auth)return auth.response;
 const {id}=await params;const org=auth.user.organizationId;
 const record=await lookup(id,org);if(!record)return fail("Record not found",404);
 const sql=db();
 const [requirements,lines,milestones,activities,related]=await Promise.all([
  sql`SELECT id,title,completed,created_at FROM crm_tender_requirements WHERE organization_id=${org} AND tender_id=${id} ORDER BY created_at`,
  sql`SELECT id,description,unit,quantity::float8 AS quantity,unit_rate::float8 AS unit_rate FROM crm_quote_line_items WHERE organization_id=${org} AND quote_id=${id} ORDER BY created_at`,
  sql`SELECT id,title,completed,to_char(due_date,'YYYY-MM-DD') AS due_date FROM crm_project_milestones WHERE organization_id=${org} AND project_id=${id} ORDER BY due_date NULLS LAST,created_at`,
  sql`SELECT a.id,a.category,a.body,a.created_at,u.name AS actor FROM crm_record_activities a JOIN crm_users u ON u.id=a.actor_id WHERE a.organization_id=${org} AND a.record_id=${id} ORDER BY a.created_at DESC LIMIT 80`,
  sql`SELECT id,kind,title,status,amount::float8 AS amount FROM crm_records WHERE organization_id=${org} AND (source_tender_id=${id} OR (id=(SELECT source_tender_id FROM crm_records WHERE id=${id} AND organization_id=${org}))) LIMIT 25`
 ]);
 return json({record,requirements,lines,milestones,activities,related});
}
export async function POST(request:NextRequest,{params}:Context){
 const auth=await authorize(request,"write");if("response" in auth)return auth.response;
 const {id}=await params,org=auth.user.organizationId,user=auth.user.id;
 try{
  const body=await request.json() as Record<string,unknown>;
  const action=str(body.action,40) as Action;
  const sql=db();
  const record=await lookup(id,org);
  if(!record)return fail("Record not found",404);
  const kind=record.kind as Kind;
  if(action==="add_note"){
   const message=str(body.body,2000);
   if(!message)return fail("Note cannot be empty",400);
   await sql`INSERT INTO crm_record_activities(organization_id,record_id,actor_id,category,body) VALUES(${org},${id},${user},'note',${message})`;
  }else if(action==="add_requirement"&&kind==="tenders"){
   const title=str(body.title);if(!title)return fail("Requirement cannot be empty",400);
   await sql`INSERT INTO crm_tender_requirements(organization_id,tender_id,title) VALUES(${org},${id},${title})`;
  }else if(action==="toggle_requirement"&&kind==="tenders"){
   await sql`UPDATE crm_tender_requirements SET completed=NOT completed,completed_at=CASE WHEN completed THEN NULL ELSE now() END WHERE id=${str(body.itemId,50)} AND tender_id=${id} AND organization_id=${org}`;
  }else if(action==="add_line"&&kind==="quotes"){
   const description=str(body.description,240),unit=str(body.unit,40)||"item",quantity=Number(body.quantity),rate=Number(body.unitRate);
   if(!description||!Number.isFinite(quantity)||quantity<=0||quantity>100000000||!Number.isFinite(rate)||rate<0||rate>1000000000)return fail("Enter a valid description, quantity and rate",400);
   await sql.begin(async tx=>{
    await tx`INSERT INTO crm_quote_line_items(organization_id,quote_id,description,unit,quantity,unit_rate) VALUES(${org},${id},${description},${unit},${quantity},${rate})`;
    const totals=await tx`SELECT COALESCE(sum(quantity*unit_rate),0)::numeric AS total FROM crm_quote_line_items WHERE organization_id=${org} AND quote_id=${id}`;
    await tx`UPDATE crm_records SET amount=${totals[0].total},updated_at=now(),updated_by=${user} WHERE organization_id=${org} AND id=${id}`;
   });
  }else if(action==="remove_line"&&kind==="quotes"){
   await sql.begin(async tx=>{
    await tx`DELETE FROM crm_quote_line_items WHERE id=${str(body.itemId,50)} AND organization_id=${org} AND quote_id=${id}`;
    const totals=await tx`SELECT COALESCE(sum(quantity*unit_rate),0)::numeric AS total FROM crm_quote_line_items WHERE organization_id=${org} AND quote_id=${id}`;
    await tx`UPDATE crm_records SET amount=${totals[0].total},updated_at=now(),updated_by=${user} WHERE organization_id=${org} AND id=${id}`;
   });
  }else if(action==="add_milestone"&&kind==="projects"){
   const title=str(body.title),due=str(body.dueDate,10);
   if(!title||due&&!/^\d{4}-\d{2}-\d{2}$/.test(due))return fail("Enter a valid milestone",400);
   await sql`INSERT INTO crm_project_milestones(organization_id,project_id,title,due_date) VALUES(${org},${id},${title},${due||null})`;
  }else if(action==="toggle_milestone"&&kind==="projects"){
   await sql.begin(async tx=>{
    await tx`UPDATE crm_project_milestones SET completed=NOT completed,completed_at=CASE WHEN completed THEN NULL ELSE now() END WHERE id=${str(body.itemId,50)} AND organization_id=${org} AND project_id=${id}`;
    const stats=await tx`SELECT count(*)::int AS total,count(*) FILTER (WHERE completed)::int AS done FROM crm_project_milestones WHERE organization_id=${org} AND project_id=${id}`;
    if(stats[0].total>0)await tx`UPDATE crm_records SET progress=${Math.round(100*stats[0].done/stats[0].total)},updated_at=now(),updated_by=${user} WHERE organization_id=${org} AND id=${id}`;
   });
  }else if(action==="handover"&&kind==="tenders"){
   if(record.status!=="Awarded")return fail("Only awarded tenders can be handed over",409);
   const result=await sql.begin(async tx=>{
    await tx`SELECT pg_advisory_xact_lock(hashtext(${id}))`;
    const present=await tx`SELECT id FROM crm_records WHERE organization_id=${org} AND source_tender_id=${id} AND kind='projects' LIMIT 1`;
    if(present.length)return present[0].id as string;
    const projectId="PRJ-"+crypto.randomUUID().replaceAll("-","").slice(0,16).toUpperCase();
    await tx`INSERT INTO crm_records(id,organization_id,kind,title,client,owner,status,amount,target_date,description,progress,created_by,updated_by,source_tender_id) VALUES(${projectId},${org},'projects',${record.title},${record.client},${record.owner},'Planning',${record.amount},${record.target_date},${"Awarded tender handover from "+id},0,${user},${user},${id})`;
    await tx`INSERT INTO crm_record_activities(organization_id,record_id,actor_id,category,body) VALUES(${org},${id},${user},'handover',${"Created project "+projectId})`;
    return projectId;
   });
   await audit(auth.user,"tender.handed_over","tenders",id,{projectId:result});
   return json({ok:true,projectId:result});
  }else return fail("Invalid operation for record type",400);
  await audit(auth.user,"operations."+action,kind,id);
  return json({ok:true});
 }catch(error){console.error("CRM operations error",error);return fail("Unable to complete operation",500)}
}
