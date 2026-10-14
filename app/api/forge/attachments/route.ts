import {NextRequest} from "next/server";
import {db} from "@/lib/forge/db";
import {authorize,fail,json} from "@/lib/forge/response";
import {audit} from "@/lib/forge/security";
export const runtime="nodejs";
const maxBytes=4*1024*1024;
export async function GET(request:NextRequest){
 const auth=await authorize(request);
 if("response" in auth)return auth.response;
 const recordId=new URL(request.url).searchParams.get("recordId")||"";
 if(!/^[A-Z]{1,4}-[0-9A-F]{16}$/.test(recordId))return fail("Invalid record ID",400);
 const docs=await db()`SELECT a.id,a.filename,a.content_type,a.size_bytes,a.created_at,u.name AS uploaded_by
 FROM crm_attachments a JOIN crm_users u ON a.uploaded_by=u.id JOIN crm_records r ON r.id=a.record_id
 WHERE a.organization_id=${auth.user.organizationId} AND r.organization_id=${auth.user.organizationId} AND a.record_id=${recordId} ORDER BY a.created_at DESC`;
 return json({attachments:docs});
}
export async function POST(request:NextRequest){
 const auth=await authorize(request,"write");
 if("response" in auth)return auth.response;
 try{
  const form=await request.formData();
  const recordId=String(form.get("recordId")||"");
  const file=form.get("file");
  if(!/^[A-Z]{1,4}-[0-9A-F]{16}$/.test(recordId))return fail("Invalid record ID",400);
  if(!(file instanceof File)||file.size<1||file.size>maxBytes)return fail("Upload a file smaller than 4 MB",400);
  const rows=await db()`SELECT id,kind FROM crm_records WHERE id=${recordId} AND organization_id=${auth.user.organizationId}`;
  if(!rows.length)return fail("Record not found",404);
  const bytes=Buffer.from(await file.arrayBuffer());
  const isPdf=bytes.subarray(0,5).toString("ascii")==="%PDF-";
  const isPng=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const isJpg=bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
  const contentType=isPdf?"application/pdf":isPng?"image/png":isJpg?"image/jpeg":null;
  if(!contentType)return fail("Only PDF, PNG and JPEG documents are supported",400);
  const filename=file.name.replace(/[\\/\x00-\x1f]/g,"_").slice(0,180)||"document";
  const inserted=await db()`INSERT INTO crm_attachments(organization_id,record_id,filename,content_type,size_bytes,contents,uploaded_by)
  VALUES(${auth.user.organizationId},${recordId},${filename},${contentType},${file.size},${bytes},${auth.user.id}) RETURNING id`;
  await audit(auth.user,"attachment.uploaded",rows[0].kind,recordId,{name:filename,size:file.size});
  return json({id:inserted[0].id},201);
 }catch(error){console.error("CRM attachment upload",error);return fail("Unable to upload document",500)}
}
