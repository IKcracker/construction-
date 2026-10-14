import {NextRequest} from "next/server";
import {timingSafeEqual} from "node:crypto";
import {db} from "@/lib/forge/db";
import {hashPassword,safeSameOrigin,createSession} from "@/lib/forge/security";
import {fail,json} from "@/lib/forge/response";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 if(!safeSameOrigin(request))return fail("Origin verification failed",403);
 const secret=process.env.FORGE_BOOTSTRAP_TOKEN;
 if(!secret||secret.length<32)return fail("Administrator setup is disabled",503);
 try{
  const body=await request.json();
  const input=String(body.token||"");const a=Buffer.from(input),b=Buffer.from(secret);
  if(a.length!==b.length||!timingSafeEqual(a,b))return fail("Invalid setup token",403);
  const name=String(body.name||"").trim().slice(0,120),email=String(body.email||"").trim().toLowerCase();
  const password=String(body.password||"");
  if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<12||password.length>128)return fail("Enter a valid name, email and a password of 12-128 characters",400);
  const hash=await hashPassword(password);
  const result=await db().begin(async tx=>{
   await tx`SELECT pg_advisory_xact_lock(680119027)`;
   const existing=await tx`SELECT count(*)::int AS total FROM crm_users`;
   if(existing[0].total>0)return null;
   const org=await tx`INSERT INTO crm_organizations(name) VALUES(${String(body.organization||"My Construction Company").trim().slice(0,160)}) RETURNING id`;
   const users=await tx`INSERT INTO crm_users(organization_id,name,email,password_hash,role) VALUES(${org[0].id},${name},${email},${hash},'admin') RETURNING id`;
   return users[0].id as string;
  });
  if(!result)return fail("An administrator already exists. Sign in instead.",409);
  await createSession(result);
  return json({ok:true},201);
 }catch(error){console.error("FORGE bootstrap error",error);return fail("Could not initialize workspace",500)}
}
