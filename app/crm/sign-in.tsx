"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
export function ForgeSignIn({initial}:{initial:boolean}){
 const router=useRouter();
 const [loading,setLoading]=useState(false),[error,setError]=useState("");
 const [forgot,setForgot]=useState(false),[sent,setSent]=useState(false);
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
 async function recover(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setLoading(true);setError("");
  try{
   const response=await fetch("/api/forge/auth/forgot-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:values.email})});
   const result=await response.json();if(!response.ok)throw new Error(result.error||"Unable to request reset");
   setSent(true);
  }catch(err){setError(err instanceof Error?err.message:"Unable to request reset")}finally{setLoading(false)}
 }
 return <main className="forge-login-page">
  <div className="forge-login-sidebar"><div className="forge-auth-brand">F<span>.</span> <small>FORGE CRM</small></div><div className="forge-login-pitch"><span>CONSTRUCTION OPERATIONS PLATFORM</span><h1>Build smarter.<br/>Manage better.</h1><p>Everything from first tender to final handover — connected in one secure workspace.</p><div className="forge-login-points"><span>01 — Tender & commercial pipelines</span><span>02 — Projects & delivery oversight</span><span>03 — Teams, tasks & documents</span></div></div><p className="forge-auth-foot">Powered by Code Tech Agency · Private workspace</p></div>
  <div className="forge-login-main"><form className="forge-login-card" onSubmit={forgot?recover:submit}>
   <div className="forge-auth-mobile-logo">FORGE<span>.</span></div>
   <span className="forge-auth-label">{initial?"INITIAL ADMINISTRATOR SETUP":"SECURE SIGN IN"}</span>
   <h2>{forgot?"Forgot your password?":initial?"Set up your workspace":"Welcome back"}</h2>
   <p>{forgot?"Enter your work email and we’ll email a one-time recovery link if an account exists.":initial?"Create the first organization and administrator using the private setup token.":"Sign in to access your construction CRM workspace."}</p>
   {initial&&!forgot&&<><label>Full name<input required autoComplete="name" value={values.name} onChange={e=>setValues({...values,name:e.target.value})} placeholder="Administrator's full name"/></label><label>Organization name<input required value={values.organization} onChange={e=>setValues({...values,organization:e.target.value})} placeholder="Your construction company"/></label></>}
   <label>Work email<input type="email" required autoComplete="email" value={values.email} onChange={e=>setValues({...values,email:e.target.value})} placeholder="name@company.com"/></label>
   {!forgot&&<label>Password<input type="password" required minLength={initial?12:1} autoComplete={initial?"new-password":"current-password"} value={values.password} onChange={e=>setValues({...values,password:e.target.value})} placeholder={initial?"At least 12 characters":"Enter your password"}/></label>}
   {initial&&!forgot&&<label>Private setup token<input type="password" required autoComplete="off" value={values.token} onChange={e=>setValues({...values,token:e.target.value})} placeholder="Provided by your administrator"/></label>}
   {error&&<div className="forge-auth-error" role="alert">{error}</div>}
   {sent&&forgot&&<div className="forge-auth-success" role="status">If that account exists, a reset link will arrive shortly. Check your inbox and spam folder.</div>}
   {!(sent&&forgot)&&<button disabled={loading} type="submit">{loading?"Please wait…":forgot?"Send reset link":initial?"Create administrator account":"Sign in to FORGE"} <span aria-hidden="true">↗</span></button>}
   {!initial&&<button type="button" className="forge-auth-secondary" onClick={()=>{setForgot(!forgot);setSent(false);setError("")}}>{forgot?"Back to sign in":"Forgot password?"}</button>}
   <div className="forge-auth-security"><span aria-hidden="true">◈</span> Encrypted session · Authorized staff only</div>
  </form></div>
 </main>;
}
