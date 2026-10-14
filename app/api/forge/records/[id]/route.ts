import {NextRequest} from "next/server";
import {db} from "@/lib/forge/db";
import {authorize,fail,json} from "@/lib/forge/response";
import {audit} from "@/lib/forge/security";
import {isModule,validateInput} from "@/lib/forge/records";
type Context={params:Promise<{id:string}>};
export async function PATCH(request:NextRequest,context:Context){
 const auth=await authorize(request,"write");
 if("response" in auth)return auth.response;
 const {id}=await context.params;
 try{
  const sql=db();
  const existing=await sql`SELECT kind,title,client,owner,status,amount,progress,to_char(target_date,'YYYY-MM-DD') AS date,description
  FROM crm_records WHERE id=${id} AND organization_id=${auth.user.organizationId} LIMIT 1`;
  if(!existing.length)return fail("Record not found",404);
  const kind=String(existing[0].kind);
  if(!isModule(kind))return fail("Invalid record module",400);
  const payload=await request.json();
  const checked=validateInput({...existing[0],...payload},kind);
  if("error" in checked)return fail(checked.error,400);
  const r=checked.data;
  await sql`UPDATE crm_records SET title=${r.title},client=${r.client},owner=${r.owner},status=${r.status},amount=${r.amount},target_date=${r.date},description=${r.description},progress=${r.progress},updated_by=${auth.user.id},updated_at=now()
  WHERE id=${id} AND organization_id=${auth.user.organizationId}`;
  await audit(auth.user,"record.updated",kind,id,{oldStatus:String(existing[0].status),newStatus:r.status});
  return json({ok:true});
 }catch(error){console.error("CRM update error",error);return fail("Unable to update record",500)}
}
export async function DELETE(request:NextRequest,context:Context){
 const auth=await authorize(request,"admin");
 if("response" in auth)return auth.response;
 const {id}=await context.params;
 try{
  const removed=await db()`DELETE FROM crm_records WHERE id=${id} AND organization_id=${auth.user.organizationId} RETURNING kind`;
  if(!removed.length)return fail("Record not found",404);
  await audit(auth.user,"record.deleted",removed[0].kind,id);
  return json({ok:true});
 }catch(error){console.error("CRM delete error",error);return fail("Unable to remove record",500)}
}
