import {NextRequest} from "next/server";
import {randomBytes} from "node:crypto";
import {db} from "@/lib/forge/db";
import {hashToken,loginFingerprint,safeSameOrigin} from "@/lib/forge/security";
import {sendForgePasswordReset} from "@/lib/forge/password-email";
import {fail,json} from "@/lib/forge/response";
const neutral="If that account exists, a password reset link will be sent shortly.";
export async function POST(request:NextRequest){
 if(!safeSameOrigin(request))return fail("Origin verification failed",403);
 try{
  const body=await request.json();
  const email=String(body.email||"").trim().toLowerCase().slice(0,200);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return fail("Enter a valid email address",400);
  const sql=db(),fp=loginFingerprint(request);
  const attempts=await sql`SELECT count(*)::int AS total FROM crm_login_attempts WHERE email=${email} AND fingerprint=${fp} AND attempted_at>now()-interval '1 hour'`;
  if(attempts[0].total>=5)return json({message:neutral});
  await sql`INSERT INTO crm_login_attempts(email,fingerprint) VALUES(${email},${fp})`;
  const users=await sql`SELECT id,email FROM crm_users WHERE lower(email)=${email} AND disabled=false LIMIT 1`;
  if(users.length){
   const token=randomBytes(32).toString("hex"),tokenHash=hashToken(token);
   const appOrigin=process.env.FORGE_APP_URL;
   if(!appOrigin||!/^https:\/\//.test(appOrigin))throw new Error("Set FORGE_APP_URL to your HTTPS deployment URL");
   const url=new URL("/crm/reset-password",appOrigin);
   url.searchParams.set("token",token);
   await sql`DELETE FROM crm_password_reset_tokens WHERE user_id=${users[0].id}`;
   await sql`INSERT INTO crm_password_reset_tokens(token_hash,user_id,expires_at) VALUES(${tokenHash},${users[0].id},now()+interval '20 minutes')`;
   try{await sendForgePasswordReset(users[0].email,url.toString())}
   catch(error){console.error("FORGE password reset mail failure",error);await sql`DELETE FROM crm_password_reset_tokens WHERE token_hash=${tokenHash}`;}
  }
  return json({message:neutral});
 }catch(error){console.error("FORGE recovery request error",error);return json({message:neutral})}
}
