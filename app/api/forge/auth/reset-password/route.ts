import {NextRequest} from "next/server";
import {db} from "@/lib/forge/db";
import {hashPassword,hashToken,safeSameOrigin} from "@/lib/forge/security";
import {fail,json} from "@/lib/forge/response";
export async function POST(request:NextRequest){
 if(!safeSameOrigin(request))return fail("Origin verification failed",403);
 try{
  const body=await request.json();
  const token=String(body.token||""),password=String(body.password||"");
  if(!/^[0-9a-f]{64}$/.test(token))return fail("Invalid or expired reset link",400);
  const hashed=await hashPassword(password);
  const sql=db();
  const changed=await sql.begin(async tx=>{
   const rows=await tx`DELETE FROM crm_password_reset_tokens WHERE token_hash=${hashToken(token)} AND expires_at>now() RETURNING user_id`;
   if(!rows.length)return false;
   const userId=rows[0].user_id;
   await tx`UPDATE crm_users SET password_hash=${hashed},must_change_password=false WHERE id=${userId} AND disabled=false`;
   await tx`DELETE FROM crm_sessions WHERE user_id=${userId}`;
   await tx`DELETE FROM crm_password_reset_tokens WHERE user_id=${userId}`;
   return true;
  });
  if(!changed)return fail("Invalid or expired reset link",400);
  return json({ok:true});
 }catch(error){if(error instanceof Error&&error.message.includes("password"))return fail(error.message,400);console.error("FORGE password reset error",error);return fail("Could not reset password",500)}
}
