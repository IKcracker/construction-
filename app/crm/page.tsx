import type {Metadata} from "next";
import {connection} from "next/server";
import {getForgeUser} from "@/lib/forge/security";
import {isForgeConfigured,db} from "@/lib/forge/db";
import {ForgeWorkspace} from "./workspace-shell";
import {ForgeSignIn} from "./sign-in";
import {ForgePasswordChange} from "./change-password";
export const metadata:Metadata={
 title:"FORGE | Construction CRM",
 description:"Secure construction CRM for tender management, quotations, projects, contacts and document control.",
 robots:{index:false,follow:false}
};
export default async function CRMPage(){
 await connection();
 if(!isForgeConfigured()){
  return <div className="forge-login-page"><div className="forge-login-card"><div className="forge-auth-brand">F<span>.</span> <small>FORGE CRM</small></div><h1>Workspace configuration required</h1><p>Connect your dedicated PostgreSQL database using the FORGE_DATABASE_URL environment variable before opening this private CRM.</p><p>The public construction website is unaffected. Ask your administrator to complete the private CRM setup.</p></div></div>;
 }
 let user:Awaited<ReturnType<typeof getForgeUser>>=null;
 let initial=false;
 let unavailable=false;
 try{
  user=await getForgeUser();
  if(!user){
   const admins=await db()`SELECT count(*)::int AS total FROM crm_users`;
   initial=admins[0].total===0 && Boolean(process.env.FORGE_BOOTSTRAP_TOKEN&&process.env.FORGE_BOOTSTRAP_TOKEN.length>=32);
  }
 }catch(error){
  console.error("FORGE workspace initialization failure",error);
  unavailable=true;
 }
 if(unavailable)return <div className="forge-login-page"><div className="forge-login-card"><div className="forge-auth-brand">F<span>.</span> <small>FORGE CRM</small></div><h1>Workspace temporarily unavailable</h1><p>The CRM cannot connect to its database. Check the database connection and migration status with your administrator.</p></div></div>;
 if(user?.mustChangePassword)return <ForgePasswordChange/>;
 if(user)return <ForgeWorkspace user={user}/>;
 return <ForgeSignIn initial={initial}/>;
}
