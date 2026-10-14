import {NextRequest} from "next/server";
import {randomBytes} from "node:crypto";
import {db} from "@/lib/forge/db";
import {authorize,fail,json} from "@/lib/forge/response";
import {audit} from "@/lib/forge/security";
import {getRecords,isModule,validateInput} from "@/lib/forge/records";
export async function GET(request:NextRequest){
 const auth=await authorize(request);
 if("response" in auth)return auth.response;
 try{return json({records:await getRecords(auth.user)})}
 catch(error){console.error("CRM records read error",error);return fail("Unable to load records",500)}
}
export async function POST(request:NextRequest){
 const auth=await authorize(request,"write");
 if("response" in auth)return auth.response;
 try{
  const body=await request.json();
  const kind=String(body.kind??"");
  if(!isModule(kind))return fail("Unknown CRM module",400);
  const checked=validateInput(body,kind);
  if("error" in checked)return fail(checked.error,400);
  const r=checked.data;
  const prefix={tenders:"TND",quotes:"Q",projects:"PRJ",clients:"CON",tasks:"TSK",documents:"DOC"}[kind];
  const id=prefix+"-"+randomBytes(8).toString("hex").toUpperCase();
  await db()`INSERT INTO crm_records(id,organization_id,kind,title,client,owner,status,amount,target_date,description,progress,created_by,updated_by)
  VALUES(${id},${auth.user.organizationId},${kind},${r.title},${r.client},${r.owner},${r.status},${r.amount},${r.date},${r.description},${r.progress},${auth.user.id},${auth.user.id})`;
  await audit(auth.user,"record.created",kind,id);
  return json({id},201);
 }catch(error){console.error("CRM create error",error);return fail("Unable to create record",500)}
}
