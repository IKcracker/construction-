import {NextRequest} from "next/server";
import {db} from "@/lib/forge/db";
import {createSession,checkPassword,safeSameOrigin,loginFingerprint} from "@/lib/forge/security";
import {fail,json} from "@/lib/forge/response";
export async function POST(request:NextRequest){
 if(!safeSameOrigin(request))return fail("Origin verification failed",403);
 try{
  const body=await request.json();
  const email=String(body.email||"").trim().toLowerCase().slice(0,200);
  const password=String(body.password||"");
  if(email.length<3||password.length>128)return fail("Invalid email or password",401);
  const fp=loginFingerprint(request);
  const sql=db();
  const attempts=await sql`SELECT count(*)::int AS total FROM crm_login_attempts WHERE email=${email} AND fingerprint=${fp} AND attempted_at>now()-interval '15 minutes'`;
  if(attempts[0].total>=8)return fail("Too many attempts. Try again in 15 minutes.",429);
  const users=await sql`SELECT id,password_hash FROM crm_users WHERE lower(email)=${email} AND disabled=false LIMIT 1`;
  const valid=users.length>0 && await checkPassword(password,users[0].password_hash);
  if(!valid){
   await sql`INSERT INTO crm_login_attempts(email,fingerprint) VALUES(${email},${fp})`;
   return fail("Invalid email or password",401);
  }
  await sql`DELETE FROM crm_login_attempts WHERE email=${email} AND fingerprint=${fp}`;
  await createSession(users[0].id);
  return json({ok:true});
 }catch(error){console.error("FORGE login error",error);return fail("Could not sign in",500)}
}
