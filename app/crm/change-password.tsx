"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
export function ForgePasswordChange(){
 const router=useRouter();
 const [current,setCurrent]=useState(""),[next,setNext]=useState(""),[confirm,setConfirm]=useState("");
 const [error,setError]=useState(""),[loading,setLoading]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");
  if(next!==confirm){setError("New passwords do not match");return}
  setLoading(true);
  try{
   const r=await fetch("/api/forge/users/change-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({currentPassword:current,newPassword:next})});
   const result=await r.json();
   if(!r.ok)throw new Error(result.error||"Could not update password");
   router.refresh();
  }catch(ex){setError(ex instanceof Error?ex.message:"Unable to update password")}
  finally{setLoading(false)}
 }
 return <main className="forge-login-page"><div className="forge-login-sidebar"><div className="forge-auth-brand">F<span>.</span> <small>FORGE CRM</small></div><div className="forge-login-pitch"><span>ACCOUNT SECURITY</span><h1>Secure your workspace.</h1><p>Before using FORGE, create your personal password. Your temporary password must be changed to protect company records.</p></div><p className="forge-auth-foot">Powered by Code Tech Agency</p></div><div className="forge-login-main"><form onSubmit={submit} className="forge-login-card"><span className="forge-auth-label">FIRST-TIME SIGN IN</span><h2>Change your password</h2><p>Create a unique password you haven&apos;t used elsewhere.</p><label>Temporary password<input required type="password" autoComplete="current-password" value={current} onChange={e=>setCurrent(e.target.value)}/></label><label>New password<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={next} onChange={e=>setNext(e.target.value)}/></label><label>Confirm new password<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>{error&&<div className="forge-auth-error" role="alert">{error}</div>}<button disabled={loading} type="submit">{loading?"Updating…":"Secure account and continue"} ↗</button></form></div></main>;
}
