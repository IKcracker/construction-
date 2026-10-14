import {NextRequest} from "next/server";
import {db} from "@/lib/forge/db";
import {authorize,fail,json} from "@/lib/forge/response";
import {audit} from "@/lib/forge/security";
export const runtime="nodejs";
type Context={params:Promise<{id:string}>};
export async function GET(request:NextRequest,context:Context){
 const auth=await authorize(request);
 if("response" in auth)return auth.response;
 const {id}=await context.params;
 const r=await db()`SELECT a.filename,a.content_type,a.contents FROM crm_attachments a
 JOIN crm_records r ON r.id=a.record_id WHERE a.id=${id} AND a.organization_id=${auth.user.organizationId} AND r.organization_id=${auth.user.organizationId} LIMIT 1`;
 if(!r.length)return fail("Document not found",404);
 const bytes=r[0].contents as Uint8Array;
 return new Response(new Uint8Array(bytes),{headers:{"Content-Type":r[0].content_type,
 "Content-Disposition":"attachment; filename*=UTF-8''"+encodeURIComponent(r[0].filename),
 "Content-Security-Policy":"default-src 'none'; sandbox",
 "X-Content-Type-Options":"nosniff","Cache-Control":"private, no-store"}});
}
export async function DELETE(request:NextRequest,context:Context){
 const auth=await authorize(request,"admin");
 if("response" in auth)return auth.response;
 const {id}=await context.params;
 const removed=await db()`DELETE FROM crm_attachments WHERE id=${id} AND organization_id=${auth.user.organizationId} RETURNING record_id,filename`;
 if(!removed.length)return fail("Document not found",404);
 await audit(auth.user,"attachment.deleted",undefined,removed[0].record_id,{name:removed[0].filename});
 return json({ok:true});
}
