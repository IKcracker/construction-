"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
type Mode="signin"|"signup"|"forgot"|"setup";
export function ForgeSignIn({initial}:{initial:boolean}){
 const router=useRouter();
 const [mode,setMode]=useState<Mode>(initial?"setup":"signin");
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[sent,setSent]=useState(false);
 const [values,setValues]=useState({name:"",organization:"",email:"",password:"",confirm:"",token:""});
 const isSignup=mode==="signup"||mode==="setup";
 const switchTo=(next:Mode)=>{setMode(next);setError("");setSent(false)};
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");
  if(isSignup&&values.confirm!==values.password){setError("Passwords do not match");setBusy(false);return}
  const endpoint=mode==="forgot"?"/api/forge/auth/forgot-password":mode==="signup"?"/api/forge/auth/register":mode==="setup"?"/api/forge/bootstrap":"/api/forge/auth/login";
  try{
   const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify(values)});
   const body=await response.json();if(!response.ok)throw new Error(body.error||"Unable to continue");
   if(mode==="forgot")setSent(true);
   else {router.refresh();router.push("/crm")}
  }catch(e){setError(e instanceof Error?e.message:"Unable to continue")}finally{setBusy(false)}
 }
 return <main className="forge-login-page forge-auth-v2">
  <section className="forge-login-sidebar">
   <div className="forge-auth-brand"><span className="forge-wordmark-icon">F</span><span className="forge-wordmark-text">FORGE<span>.</span><small>CONSTRUCTION CRM</small></span></div>
   <div className="forge-login-pitch"><span className="forge-login-kicker"><i/> THE CONSTRUCTION COMMAND CENTER</span><h1>Where projects<br/>take <em>shape.</em></h1><p>From first tender to final handover. One connected workspace for your commercial, field and delivery teams.</p><div className="forge-login-points"><div><b>01</b><span>Capture tenders and win more opportunities</span></div><div><b>02</b><span>Control quotations, projects and milestones</span></div><div><b>03</b><span>Keep every client, file and task in sync</span></div></div></div>
   <div className="forge-login-bottom"><span className="forge-login-decoration">F / C</span><p>Designed for construction teams.<br/>Powered by Code Tech Agency.</p></div>
  </section>
  <section className="forge-login-main"><div className="forge-login-card">
   <div className="forge-auth-mobile-logo">FORGE<span>.</span></div>
   <div className="forge-auth-panel-header"><div className="forge-auth-label">{mode==="forgot"?"ACCOUNT RECOVERY":mode==="signin"?"YOUR WORKSPACE":mode==="setup"?"INITIAL CONFIGURATION":"CREATE YOUR WORKSPACE"}</div><h2>{mode==="signin"?"Welcome back.":mode==="forgot"?"Reset your password.":mode==="setup"?"Set up FORGE.":"Build your workspace."}</h2><p>{mode==="signin"?"Enter your credentials to continue where your team left off.":mode==="forgot"?"We’ll send you a secure link if your email is registered.":mode==="setup"?"Create the initial administrator for this installation.":"Create your company workspace and start managing operations."}</p></div>
   {mode!=="forgot"&&mode!=="setup"&&<div className="forge-auth-tabs" role="group" aria-label="Account access"><button type="button" className={mode==="signin"?"active":""} onClick={()=>switchTo("signin")}>Sign in</button><button type="button" className={mode==="signup"?"active":""} onClick={()=>switchTo("signup")}>Create account</button></div>}
   <form className="forge-login-form" onSubmit={submit}>
   {isSignup&&<><label>Company name<input required maxLength={160} autoComplete="organization" value={values.organization} onChange={e=>setValues({...values,organization:e.target.value})} placeholder="Your construction company"/></label><label>Full name<input required maxLength={120} autoComplete="name" value={values.name} onChange={e=>setValues({...values,name:e.target.value})} placeholder="Your full name"/></label></>}
   <label>Work email<input required type="email" maxLength={200} autoComplete="email" value={values.email} onChange={e=>setValues({...values,email:e.target.value})} placeholder="you@company.co.za"/></label>
   {mode!=="forgot"&&<label>Password<input required type="password" minLength={isSignup?12:1} maxLength={128} autoComplete={isSignup?"new-password":"current-password"} value={values.password} onChange={e=>setValues({...values,password:e.target.value})} placeholder={isSignup?"At least 12 characters":"Your account password"}/></label>}
   {isSignup&&<label>Confirm password<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={values.confirm} onChange={e=>setValues({...values,confirm:e.target.value})} placeholder="Re-enter your password"/></label>}
   {mode==="setup"&&<label>Private setup token<input required type="password" autoComplete="off" value={values.token} onChange={e=>setValues({...values,token:e.target.value})} placeholder="Administrator setup token"/></label>}
   {error&&<div className="forge-auth-error" role="alert">{error}</div>}
   {sent&&mode==="forgot"?<div className="forge-auth-success" role="status">If that email is registered, you’ll receive a password reset link shortly.</div>:<button className="forge-auth-submit" type="submit" disabled={busy}><span>{busy?"Please wait…":mode==="signin"?"Sign in to workspace":mode==="signup"?"Create my workspace":mode==="setup"?"Create administrator":"Send recovery link"}</span><span aria-hidden="true">↗</span></button>}
   </form>
   <div className="forge-auth-links">{mode==="signin"?<button onClick={()=>switchTo("forgot")}>Forgot password?</button>:mode==="forgot"?<button onClick={()=>switchTo("signin")}>← Back to sign in</button>:mode==="signup"?<button onClick={()=>switchTo("signin")}>Already have an account? Sign in</button>:null}</div>
   <div className="forge-auth-security"><span aria-hidden="true">◈</span> Private workspace · Secure sign-in · Your data stays within your organisation</div>
  </div></section>
 </main>;
}
