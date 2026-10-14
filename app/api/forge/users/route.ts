import {NextRequest} from "next/server";
import {db} from "@/lib/forge/db";
import {hashPassword} from "@/lib/forge/security";
import {authorize,fail,json} from "@/lib/forge/response";
export const runtime="nodejs";
export async function GET(request:NextRequest){
 const auth=await authorize(request);
 if("response" in auth)return auth.response;
 const users=await db()`SELECT id,name,email,role,disabled,created_at FROM crm_users WHERE organization_id=${auth.user.organizationId} ORDER BY name`;
 return json({users});
}
export async function POST(request:NextRequest){
 const auth=await authorize(request,"admin");
 if("response" in auth)return auth.response;
 try{
  const input=await request.json();
  const name=String(input.name||"").trim(),email=String(input.email||"").trim().toLowerCase(),role=String(input.role||"viewer"),password=String(input.password||"");
  if(name.length<2||name.length>120||email.length>200||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!["admin","editor","viewer"].includes(role))return fail("Invalid name, email or role",400);
  const hash=await hashPassword(password);
  const created=await db()`INSERT INTO crm_users(organization_id,name,email,role,password_hash,must_change_password)
   VALUES(${auth.user.organizationId},${name},${email},${role},${hash},true) RETURNING id,name,email,role`;
  return json({user:created[0]},201);
 }catch(error){
  if(error instanceof Error&&error.message.includes("duplicate key"))return fail("Email already in use",409);
  if(error instanceof Error&&error.message.includes("password"))return fail(error.message,400);
  console.error("FORGE create user error",error);return fail("Could not create staff account",500);
 }
}
