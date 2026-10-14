"use client";
import {useState,type FormEvent} from "react";
import {useSearchParams} from "next/navigation";
export function ForgeResetForm(){
 const token=useSearchParams().get("token")||"";
 const [password,setPassword]=useState(""),[confirm,setConfirm]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[done,setDone]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(password!==confirm){setError("Passwords do not match");return}
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/forge/auth/reset-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,password})});
   const data=await r.json();if(!r.ok)throw new Error(data.error||"Unable to reset password");
   setDone(true);
  }catch(err){setError(err instanceof Error?err.message:"Unable to reset password")}finally{setBusy(false)}
 }
 return <main className="forge-login-page"><div className="forge-login-sidebar"><div className="forge-auth-brand">F<span>.</span> <small>FORGE CRM</small></div><div className="forge-login-pitch"><span>ACCOUNT SECURITY</span><h1>Back to building.</h1><p>Choose a strong password to regain access to your construction workspace.</p></div><p className="forge-auth-foot">Powered by Code Tech Agency</p></div><div className="forge-login-main"><div className="forge-login-card"><span className="forge-auth-label">ACCOUNT RECOVERY</span><h2>{done?"Password updated":"Reset your password"}</h2>{done?<><p>Your password has been changed. All previous sessions have been signed out.</p><a className="forge-auth-link" href="/crm">Return to sign in</a></>:<form onSubmit={submit} className="forge-recovery-form"><p>{token?"Enter your new password below.":"This reset link is missing or invalid. Request a new one from the sign-in page."}</p>{token&&<><label>New password<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><label>Confirm password<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>{error&&<div className="forge-auth-error" role="alert">{error}</div>}<button disabled={busy} type="submit">{busy?"Saving…":"Reset password"} ↗</button></>}<a className="forge-auth-link" href="/crm">Back to sign in</a></form>}</div></div></main>;
}
