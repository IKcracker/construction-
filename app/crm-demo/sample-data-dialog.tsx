"use client";
import {useEffect,useState,type FormEvent} from "react";
import {Icon} from "./crm-icons";
type SeedPreview={
 installed:boolean;installedAt:string|null;
 summary:{records:number;requirements:number;lines:number;milestones:number;activities:number;byModule:Record<string,number>};
 existing:{real:number;sample:number};
};
export function SampleDataDialog({onClose,onLoaded}:{onClose:()=>void;onLoaded:()=>Promise<void>}){
 const [preview,setPreview]=useState<SeedPreview|null>(null);
 const [error,setError]=useState(""),[busy,setBusy]=useState(false);
 const [confirm,setConfirm]=useState("");
 useEffect(()=>{
  let cancelled=false;
  fetch("/api/forge/seeds",{cache:"no-store"}).then(async r=>{
   const response=await r.json();
   if(!r.ok)throw Error(response.error||"Unable to check sample records");
   return response as SeedPreview;
  }).then(r=>{if(!cancelled)setPreview(r)})
    .catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:"Unable to load sample preview")});
  return ()=>{cancelled=true};
 },[]);
 async function load(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(!preview||preview.installed||preview.existing.real>0||busy||confirm!=="LOAD SAMPLE DATA")return;
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/forge/seeds",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({confirm})
   });
   const result=await r.json();
   if(!r.ok)throw Error(result.error||"Unable to load sample records");
   await onLoaded();
  }catch(e){setError(e instanceof Error?e.message:"Unable to load sample records");setBusy(false)}
 }
 const blocked=!!preview&&(preview.installed||preview.existing.real>0||preview.existing.sample>0);
 return <div className="forge-overlay" onMouseDown={e=>{if(!busy&&e.target===e.currentTarget)onClose()}}>
   <section className="forge-dialog forge-seed-dialog" role="dialog" aria-modal="true" aria-label="Sample data installation">
    <div className="forge-dialog-head"><span className="forge-guide-badge"><Icon name="layers" size={16}/> SHOWCASE DATA</span><button disabled={busy} onClick={onClose} aria-label="Close"><Icon name="x" size={19}/></button></div>
    <h2>Explore a populated CRM.</h2>
    <p>Install clearly marked, fictional construction records to explore the full tender, quotation and project workflow with realistic information.</p>
    {error&&<div className="forge-auth-error" role="alert">{error}</div>}
    {!preview&&!error&&<p className="forge-seed-subtle">Checking your workspace…</p>}
    {preview&&<>
     <div className="forge-seed-breakdown">
      {Object.entries(preview.summary.byModule).map(([kind,total])=><div key={kind}><strong>{total}</strong><span>{kind==="quotes"?"Quotations":kind.charAt(0).toUpperCase()+kind.slice(1)}</span></div>)}
     </div>
     <p className="forge-seed-subtle">Includes {preview.summary.lines} priced BOQ items, {preview.summary.milestones} project milestones, {preview.summary.requirements} tender compliance checks and {preview.summary.activities} activity updates.</p>
     <div className="forge-seed-warning"><Icon name="info" size={19}/><div><strong>All records are fictional.</strong><p>Examples are labelled as sample data. No real contact emails, staff accounts or document attachments are created. The pack cannot be loaded twice.</p></div></div>
     {preview.installed?<div className="forge-seed-status"><Icon name="check-circle" size={18}/> This workspace already has the sample pack installed.</div>
      :preview.existing.real>0?<div className="forge-seed-status forge-seed-status-caution"><Icon name="alert" size={18}/> This workspace contains {preview.existing.real} real records. For safety, install examples in a separate empty workspace. The CLI supports an explicitly confirmed mixed-data installation.</div>
      :preview.existing.sample>0?<div className="forge-seed-status forge-seed-status-caution"><Icon name="alert" size={18}/> Existing sample records were detected. Ask an administrator to check the sample installation history first.</div>
      :<form onSubmit={load} className="forge-seed-form">
        <label>To confirm, type <strong>LOAD SAMPLE DATA</strong><input value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="off" placeholder="LOAD SAMPLE DATA" required/></label>
        <button className="forge-btn forge-btn-primary" disabled={busy||confirm!=="LOAD SAMPLE DATA"} type="submit"><Icon name="plus" size={17}/>{busy?"Adding sample records…":"Load sample data"}</button>
       </form>}
     {blocked&&<button className="forge-btn forge-btn-light forge-seed-close" onClick={onClose}>Close</button>}
    </>}
   </section>
  </div>;
}
