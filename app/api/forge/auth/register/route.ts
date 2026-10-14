import {NextRequest} from "next/server";
import {db} from "@/lib/forge/db";
import {hashPassword,createSession,loginFingerprint,safeSameOrigin} from "@/lib/forge/security";
import {fail,json} from "@/lib/forge/response";

export async function POST(request:NextRequest){
 if(!safeSameOrigin(request))return fail("Origin verification failed",403);
 try{
  const body=await request.json();
  const name=String(body.name||"").trim(),organization=String(body.organization||"").trim();
  const email=String(body.email||"").trim().toLowerCase(),password=String(body.password||"");
  if(name.length<2||name.length>120||organization.length<2||organization.length>160||
     email.length>200||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||
     password.length<12||password.length>128)return fail("Enter a company name, full name, valid work email and password of 12-128 characters",400);
  // Registration is limited per client fingerprint; no existing workspace is ever modified.
  const fingerprint=loginFingerprint(request),sql=db();
  const attempts=await sql`SELECT count(*)::int AS total FROM crm_login_attempts WHERE email=${email} AND fingerprint=${fingerprint} AND attempted_at>now()-interval '1 hour'`;
  if(attempts[0].total>=4)return fail("Too many attempts. Try again later.",429);
  await sql`INSERT INTO crm_login_attempts(email,fingerprint) VALUES(${email},${fingerprint})`;
  const hash=await hashPassword(password);
  const id=await sql.begin(async tx=>{
   const org=await tx`INSERT INTO crm_organizations(name) VALUES(${organization}) RETURNING id`;
   const users=await tx`INSERT INTO crm_users(organization_id,name,email,password_hash,role)
    VALUES(${org[0].id},${name},${email},${hash},'admin') RETURNING id`;
   return users[0].id as string;
  });
  await createSession(id);
  return json({ok:true},201);
 }catch(error){
  if(error instanceof Error && (error.message.includes("duplicate key")||error.message.includes("crm_users_email_unique")))return fail("This email already has an account. Sign in or reset your password.",409);
  console.error("FORGE registration error",error);return fail("Could not create workspace",500);
 }
}
