import "server-only";
import {createHash,randomBytes,scrypt as scryptCallback,timingSafeEqual} from "node:crypto";
import {promisify} from "node:util";
import {cookies} from "next/headers";
import {db} from "./db";
const scrypt=promisify(scryptCallback);
const sessionKey="forge_session";
export type ForgeRole="admin"|"editor"|"viewer";
export type ForgeUser={id:string;organizationId:string;organizationName:string;name:string;email:string;role:ForgeRole;mustChangePassword:boolean};
export const hashToken=(token:string)=>createHash("sha256").update(token).digest("hex");
export function secureResponseHeaders(){return {"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};}
export function safeSameOrigin(request:Request){
 const origin=request.headers.get("origin");
 if(!origin)return request.headers.get("sec-fetch-site")==="same-origin";
 const url=new URL(request.url);
 const forwardedHost=request.headers.get("x-forwarded-host")||request.headers.get("host")||url.host;
 const forwardedProto=request.headers.get("x-forwarded-proto")||url.protocol.slice(0,-1);
 return origin===url.origin || origin===forwardedProto+"://"+forwardedHost;
}
export async function hashPassword(password:string){
 if(password.length<12||password.length>128)throw new Error("Use a password between 12 and 128 characters.");
 const salt=randomBytes(24).toString("hex");
 const hash=(await scrypt(password,salt,64)) as Buffer;
 return "scrypt:"+salt+":"+hash.toString("hex");
}
export async function checkPassword(password:string,hash:string){
 const pieces=hash.split(":");
 if(pieces.length!==3 ||pieces[0]!=="scrypt")return false;
 const expected=Buffer.from(pieces[2],"hex");
 if(expected.length!==64)return false;
 const calculated=(await scrypt(password,pieces[1],64)) as Buffer;
 return timingSafeEqual(calculated,expected);
}
export async function getForgeUser():Promise<ForgeUser|null>{
 const token=(await cookies()).get(sessionKey)?.value;
 if(!token||!/^[0-9a-f]{64}$/.test(token))return null;
 const rows=await db()`SELECT u.id,u.organization_id,u.name,u.email,u.role,u.must_change_password,o.name AS organization_name
  FROM crm_sessions s JOIN crm_users u ON u.id=s.user_id
  JOIN crm_organizations o ON o.id=u.organization_id
  WHERE s.token_hash=${hashToken(token)} AND s.expires_at>now() AND u.disabled=false LIMIT 1`;
 if(!rows.length)return null;
 const u=rows[0];
 return {id:u.id,organizationId:u.organization_id,organizationName:u.organization_name,name:u.name,email:u.email,role:u.role,mustChangePassword:Boolean(u.must_change_password)};
}
export function permitted(user:ForgeUser,action:"read"|"write"|"admin"){
 return action==="read" || (action==="write"&&user.role!=="viewer") || (action==="admin"&&user.role==="admin");
}
export async function createSession(userId:string){
 const token=randomBytes(32).toString("hex");
 await db()`INSERT INTO crm_sessions(token_hash,user_id,expires_at) VALUES(${hashToken(token)},${userId},now()+interval '7 days')`;
 (await cookies()).set(sessionKey,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:7*24*60*60});
}
export async function deleteSession(){
 const jar=await cookies();
 const token=jar.get(sessionKey)?.value;
 if(token && /^[0-9a-f]{64}$/.test(token))await db()`DELETE FROM crm_sessions WHERE token_hash=${hashToken(token)}`;
 jar.delete(sessionKey);
}
export async function audit(user:ForgeUser,type:string,kind?:string,recordId?:string,metadata:Record<string,string|number|boolean>={}){
 await db()`INSERT INTO crm_audit_events(organization_id,actor_id,event_type,record_kind,record_id,metadata)
 VALUES(${user.organizationId},${user.id},${type},${kind||null},${recordId||null},${JSON.stringify(metadata)}::jsonb)`;
}
export function loginFingerprint(request:Request){
 const ip=(request.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim().slice(0,80);
 return hashToken(ip+":"+(process.env.FORGE_RATE_LIMIT_SALT||"forge"));
}
