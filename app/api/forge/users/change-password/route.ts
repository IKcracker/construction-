import {NextRequest} from "next/server";
import {db} from "@/lib/forge/db";
import {hashPassword,checkPassword,safeSameOrigin,hashToken} from "@/lib/forge/security";
import {authorize,fail,json} from "@/lib/forge/response";
export async function POST(request:NextRequest){
 if(!safeSameOrigin(request))return fail("Origin verification failed",403);
 const auth=await authorize(request,"read");
 if("response" in auth)return auth.response;
 try{
  const body=await request.json();
  const current=String(body.currentPassword||""),next=String(body.newPassword||"");
  if(current.length>128)return fail("Invalid password",400);
  const rows=await db()`SELECT password_hash FROM crm_users WHERE id=${auth.user.id}`;
  if(!rows.length||!await checkPassword(current,rows[0].password_hash))return fail("Current password is incorrect",403);
  const hash=await hashPassword(next);
  await db()`UPDATE crm_users SET password_hash=${hash},must_change_password=false WHERE id=${auth.user.id}`;
  await db()`DELETE FROM crm_sessions WHERE user_id=${auth.user.id} AND token_hash<>${hashToken((await (await import("next/headers")).cookies()).get("forge_session")?.value||"")}`;
  return json({ok:true});
 }catch(error){if(error instanceof Error&&error.message.includes("password"))return fail(error.message,400);return fail("Unable to change password",500)}
}
