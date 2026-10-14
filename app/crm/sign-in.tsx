"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
export function ForgeSignIn({initial}:{initial:boolean}){
 const router=useRouter();
 const [loading,setLoading]=useState(false),[error,setError]=useState("");
 const [values,setValues]=useState({name:"",organization:"",email:"",password:"",token:""});
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setLoading(true);setError("");
  try{
   const response=await fetch(initial?"/api/forge/bootstrap":"/api/forge/auth/login",{
    method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values),credentials:"same-origin"
   });
   const payload=await response.json();
   if(!response.ok)throw new Error(payload.error||"Unable to sign in");
   router.refresh();
  }catch(err){setError(err instanceof Error?err.message:"Unable to connect")}finally{setLoading(false)}
 }
 return <main className="forge-login-page">
  <div className="forge-login-sidebar"><div className="forge-auth-brand">F<span>.</span> <small>FORGE CRM</small></div><div className="forge-login-pitch"><span>CONSTRUCTION OPERATIONS PLATFORM</span><h1>Build smarter.<br/>Manage better.</h1><p>Everything from first tender to final handover — connected in one secure workspace.</p><div className="forge-login-points"><span>01 — Tender & commercial pipelines</span><span>02 — Projects & delivery oversight</span><span>03 — Teams, tasks & documents</span></div></div><p className="forge-auth-foot">Powered by Code Tech Agency · Private workspace</p></div>
  <div className="forge-login-main"><form className="forge-login-card" onSubmit={submit}>
   <div className="forge-auth-mobile-logo">FORGE<span>.</span></div>
   <span className="forge-auth-label">{initial?"INITIAL ADMINISTRATOR SETUP":"SECURE SIGN IN"}</span>
   <h2>{initial?"Set up your workspace":"Welcome back"}</h2>
   <p>{initial?"Create the first organization and administrator using the private setup token.":"Sign in to access your construction CRM workspace."}</p>
   {initial&&<><label>Full name<input required autoComplete="name" value={values.name} onChange={e=>setValues({...values,name:e.target.value})} placeholder="Administrator's full name"/></label><label>Organization name<input required value={values.organization} onChange={e=>setValues({...values,organization:e.target.value})} placeholder="Your construction company"/></label></>}
   <label>Work email<input type="email" required autoComplete="email" value={values.email} onChange={e=>setValues({...values,email:e.target.value})} placeholder="name@company.com"/></label>
   <label>Password<input type="password" required minLength={initial?12:1} autoComplete={initial?"new-password":"current-password"} value={values.password} onChange={e=>setValues({...values,password:e.target.value})} placeholder={initial?"At least 12 characters":"Enter your password"}/></label>
   {initial&&<label>Private setup token<input type="password" required autoComplete="off" value={values.token} onChange={e=>setValues({...values,token:e.target.value})} placeholder="Provided by your administrator"/></label>}
   {error&&<div className="forge-auth-error" role="alert">{error}</div>}
   <button disabled={loading} type="submit">{loading?"Please wait…":initial?"Create administrator account":"Sign in to FORGE"} <span aria-hidden="true">↗</span></button>
   <div className="forge-auth-security"><span aria-hidden="true">◈</span> Encrypted session · Authorized staff only</div>
  </form></div>
 </main>;
}
