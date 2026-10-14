"use client";
import {useEffect,useState,type FormEvent} from "react";
import {Icon} from "@/app/crm-demo/crm-icons";
import {OperationsWorkbench} from "@/app/crm-demo/operations-workbench";
import {config,dateLabel,money,stageClass,type CrmRecord,type ModuleKey} from "@/app/crm-demo/crm-data";
import type {ForgeUser} from "@/lib/forge/security";

type Attachment={id:string;filename:string;size_bytes:number;uploaded_by:string};
export type RecordPanel={module:ModuleKey;mode:"view"|"new"|"edit";id?:string};
type Props={panel:RecordPanel;record?:CrmRecord;user:ForgeUser;owners:string[];onBack:()=>void;onEdit:()=>void;onRefresh:()=>Promise<void>;onHandover:(id:string)=>void;notify:(message:string,tone?:"error"|"success")=>void};
const emptyRecord=(kind:ModuleKey,owner:string):CrmRecord=>({id:"",title:"",client:"",owner,status:config[kind].statuses[0],amount:0,progress:0,date:new Date().toISOString().slice(0,10),description:""});
export function WorkspaceRecord({panel,record,user,owners,onBack,onEdit,onRefresh,onHandover,notify}:Props){
 const [tab,setTab]=useState<"overview"|"operations"|"files">("overview");
 const [draft,setDraft]=useState<CrmRecord>(()=>record?{...record}:emptyRecord(panel.module,user.name));
 const [attachments,setAttachments]=useState<Attachment[]>([]);
 const [busy,setBusy]=useState(false),[uploading,setUploading]=useState(false),[confirmDelete,setConfirmDelete]=useState(false);
 const canWrite=user.role!=="viewer",isForm=panel.mode!=="view",isCommercial=["tenders","quotes","projects"].includes(panel.module);
 useEffect(()=>{
  if(!panel.id)return;
  let cancelled=false;
  fetch("/api/forge/attachments?recordId="+encodeURIComponent(panel.id),{cache:"no-store"})
   .then(async r=>r.ok?r.json():{attachments:[]}).then(data=>{if(!cancelled)setAttachments(data.attachments||[])})
   .catch(()=>{if(!cancelled)setAttachments([])});
  return ()=>{cancelled=true};
 },[panel.id]);
 async function reloadFiles(){
  if(!panel.id)return;
  const response=await fetch("/api/forge/attachments?recordId="+encodeURIComponent(panel.id),{cache:"no-store"});
  if(response.ok)setAttachments((await response.json()).attachments||[]);
 }
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy||!canWrite)return;setBusy(true);
  try{
   const creating=panel.mode==="new";
   const res=await fetch(creating?"/api/forge/records":"/api/forge/records/"+encodeURIComponent(panel.id||""),{method:creating?"POST":"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({...draft,kind:panel.module})});
   const data=await res.json();if(!res.ok)throw Error(data.error||"Unable to save record");
   await onRefresh();notify(creating?"Record created successfully":"Record changes saved");onBack();
  }catch(e){notify(e instanceof Error?e.message:"Unable to save record","error")}finally{setBusy(false)}
 }
 async function changeStage(next:string){
  if(!panel.id||!canWrite||busy)return;setBusy(true);
  try{
   const res=await fetch("/api/forge/records/"+encodeURIComponent(panel.id),{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:next})});
   const data=await res.json();if(!res.ok)throw Error(data.error||"Unable to update stage");
   await onRefresh();notify("Stage updated to "+next);
  }catch(e){notify(e instanceof Error?e.message:"Stage update failed","error")}finally{setBusy(false)}
 }
 async function deleteRecord(){
  if(!panel.id||user.role!=="admin"||busy)return;setBusy(true);
  try{
   const res=await fetch("/api/forge/records/"+encodeURIComponent(panel.id),{method:"DELETE"});
   const data=await res.json();if(!res.ok)throw Error(data.error||"Unable to delete record");
   await onRefresh();notify("Record deleted");onBack();
  }catch(e){notify(e instanceof Error?e.message:"Delete failed","error")}finally{setBusy(false)}
 }
 async function upload(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!panel.id||!canWrite||uploading)return;const form=e.currentTarget;
  const data=new FormData(form);data.set("recordId",panel.id);setUploading(true);
  try{
   const res=await fetch("/api/forge/attachments",{method:"POST",body:data});const result=await res.json();
   if(!res.ok)throw Error(result.error||"Upload failed");
   await reloadFiles();form.reset();notify("Attachment uploaded");
  }catch(err){notify(err instanceof Error?err.message:"Upload failed","error")}finally{setUploading(false)}
 }
 async function deleteFile(id:string){
  if(user.role!=="admin"||!window.confirm("Delete this attachment permanently?"))return;
  const res=await fetch("/api/forge/attachments/"+encodeURIComponent(id),{method:"DELETE"});
  if(res.ok){await reloadFiles();notify("Attachment deleted")}else{const data=await res.json();notify(data.error||"Delete failed","error")}
 }
 return <div className="f2-record-page">
  <div className="f2-crumb"><button type="button" onClick={onBack}><Icon name="arrow" className="f2-flip" size={15}/>{config[panel.module].title}</button><Icon name="chevron" size={14}/><span>{panel.mode==="new"?"New record":record?.id||"Record"}</span></div>
  <div className="f2-page-heading f2-record-heading"><div><div className="f2-eyebrow">{config[panel.module].singular.toUpperCase()} / {panel.mode==="new"?"NEW":record?.id}</div><h1>{isForm?(panel.mode==="new"?"New "+config[panel.module].singular:"Edit "+config[panel.module].singular):record?.title||"Record not found"}</h1><p>{isForm?"Complete the information below to save this record.":record?.client+" · "+record?.owner}{record?.isSample&&<span className="f2-sample-tag">FICTIONAL SAMPLE</span>}</p></div><div className="f2-heading-actions"><button className="f2-btn f2-btn-outline" type="button" onClick={onBack}><Icon name="arrow" className="f2-flip" size={16}/> Back</button>{!isForm&&canWrite&&record&&<button type="button" className="f2-btn f2-btn-primary" onClick={onEdit}><Icon name="pencil" size={16}/> Edit record</button>}</div></div>
  {!record&&!isForm&&<div className="f2-empty"><Icon name="alert" size={28}/><h3>This record is no longer available.</h3><button className="f2-btn f2-btn-outline" onClick={onBack}>Return to register</button></div>}
  {isForm&&<form className="f2-editor" onSubmit={save}><section className="f2-panel"><div className="f2-panel-heading"><div><span className="f2-eyebrow">01 / RECORD DETAILS</span><h2>General information</h2><p>Information shared with your organization’s team.</p></div></div><div className="f2-form-grid">
    <label className="f2-field f2-field-wide"><span>{panel.module==="clients"?"Contact name":"Record title"} *</span><input autoFocus required maxLength={160} value={draft.title} placeholder={config[panel.module].placeholder} onChange={e=>setDraft({...draft,title:e.target.value})}/></label>
    <label className="f2-field"><span>{panel.module==="clients"?"Organization":panel.module==="tasks"?"Related company / project":"Client / organization"} *</span><input required maxLength={160} value={draft.client} onChange={e=>setDraft({...draft,client:e.target.value})}/></label>
    <label className="f2-field"><span>Assigned owner *</span><select required value={draft.owner} onChange={e=>setDraft({...draft,owner:e.target.value})}>{[...new Set([...owners,draft.owner])].filter(Boolean).map(n=><option key={n}>{n}</option>)}</select></label>
    <label className="f2-field"><span>Workflow stage</span><select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value})}>{config[panel.module].statuses.map(st=><option key={st}>{st}</option>)}</select></label>
    <label className="f2-field"><span>{panel.module==="tenders"?"Tender closing date":panel.module==="tasks"?"Due date":panel.module==="quotes"?"Valid until":"Target / follow-up date"}</span><input required type="date" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})}/></label>
    {isCommercial&&<label className="f2-field"><span>Value in ZAR</span><input type="number" min="0" step="0.01" value={draft.amount} onChange={e=>setDraft({...draft,amount:Number(e.target.value)})}/></label>}
    {panel.module==="projects"&&<label className="f2-field"><span>Progress (%)</span><input type="number" min="0" max="100" value={draft.progress??0} onChange={e=>setDraft({...draft,progress:Number(e.target.value)})}/></label>}
    <label className="f2-field f2-field-wide"><span>Project context / notes</span><textarea rows={5} maxLength={10000} value={draft.description} placeholder="Scope, requirements, risks, actions and next steps…" onChange={e=>setDraft({...draft,description:e.target.value})}/></label>
   </div></section><div className="f2-editor-footer"><span><Icon name="shield" size={16}/> Saved to your company database</span><div><button type="button" className="f2-btn f2-btn-outline" onClick={onBack}>Cancel</button><button type="submit" disabled={busy} className="f2-btn f2-btn-primary"><Icon name="check" size={17}/>{busy?"Saving…":"Save record"}</button></div></div></form>}
  {!isForm&&record&&<div className="f2-record-grid"><div className="f2-record-main">
   <div className="f2-tabs" role="tablist" aria-label="Record details">{([{key:"overview",label:"Overview",icon:"grid"},{key:"operations",label:"Operations & activity",icon:"layers"},{key:"files",label:"Documents",icon:"folder"}] as const).map(t=><button type="button" role="tab" aria-selected={tab===t.key} key={t.key} className={tab===t.key?"active":""} onClick={()=>setTab(t.key)}><Icon name={t.icon} size={16}/>{t.label}{t.key==="files"&&<b>{attachments.length}</b>}</button>)}</div>
   {tab==="overview"&&<div className="f2-tab-stack"><section className="f2-panel"><div className="f2-panel-heading"><div><span className="f2-eyebrow">RECORD OVERVIEW</span><h2>Commercial & operational details</h2></div><Icon name="briefcase" size={19}/></div><div className="f2-facts">{isCommercial&&<div><span>{panel.module==="projects"?"Contract value":panel.module==="quotes"?"Quotation total":"Tender estimate"}</span><strong className="f2-value">{money(record.amount)}</strong></div>}<div><span>Client</span><strong>{record.client}</strong></div><div><span>Owner</span><strong>{record.owner}</strong></div><div><span>Status</span><strong><span className={"f2-status "+stageClass(record.status)}><i/>{record.status}</span></strong></div><div><span>Target date</span><strong>{dateLabel(record.date)}</strong></div>{panel.module==="projects"&&<div><span>Project completion</span><strong>{record.progress||0}%</strong></div>}</div>{panel.module==="projects"&&<div className="f2-progress"><div><span>Delivery progress</span><strong>{record.progress||0}%</strong></div><div className="f2-progress-track"><i style={{width:Math.min(100,Math.max(0,record.progress||0))+"%"}}/></div></div>}</section><section className="f2-panel"><div className="f2-panel-heading"><div><span className="f2-eyebrow">SCOPE</span><h2>Description & context</h2></div></div><p className="f2-description">{record.description||"No description has been added yet."}</p></section></div>}
   {tab==="operations"&&<div className="f2-panel f2-ops-panel"><OperationsWorkbench id={record.id} kind={panel.module} status={record.status} canEdit={canWrite} onChanged={onRefresh} onHandover={onHandover}/></div>}
   {tab==="files"&&<div className="f2-panel"><div className="f2-panel-heading"><div><span className="f2-eyebrow">DOCUMENT CONTROL</span><h2>Record attachments <span className="f2-muted-count">{attachments.length}</span></h2><p>PDF, PNG and JPEG files, maximum 4 MB each.</p></div><Icon name="folder" size={19}/></div>{attachments.length?<div className="f2-file-list">{attachments.map(a=><div className="f2-file" key={a.id}><span className="f2-file-symbol"><Icon name="file" size={20}/></span><div><strong>{a.filename}</strong><small>{(a.size_bytes/1024).toFixed(0)} KB · {a.uploaded_by}</small></div><a aria-label={"Download "+a.filename} href={"/api/forge/attachments/"+encodeURIComponent(a.id)}><Icon name="download" size={17}/></a>{user.role==="admin"&&<button aria-label={"Delete "+a.filename} onClick={()=>deleteFile(a.id)}><Icon name="trash" size={16}/></button>}</div>)}</div>:<div className="f2-empty"><Icon name="folder" size={28}/><h3>No files attached</h3><p>Add compliance documentation, plans, site photographs or correspondence.</p></div>}{canWrite&&<form className="f2-upload" onSubmit={upload}><label>Choose a file<input required type="file" name="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"/></label><button className="f2-btn f2-btn-primary" type="submit" disabled={uploading}><Icon name="plus" size={16}/>{uploading?"Uploading…":"Upload"}</button></form>}</div>}
   </div><aside className="f2-record-aside"><section className="f2-panel f2-aside-panel"><span className="f2-eyebrow">RECORD CONTROL</span><h3>Workflow status</h3><span className={"f2-status f2-status-lg "+stageClass(record.status)}><i/>{record.status}</span>{canWrite&&<label className="f2-field"><span>Move to another stage</span><select disabled={busy} value={record.status} onChange={e=>changeStage(e.target.value)}>{config[panel.module].statuses.map(s=><option key={s}>{s}</option>)}</select></label>}<div className="f2-aside-divider"/><span className="f2-meta-label">RECORD REFERENCE</span><strong className="f2-record-ref">{record.id}</strong></section><section className="f2-panel f2-aside-panel"><span className="f2-eyebrow">QUICK ACTIONS</span><h3>Manage this record</h3><button className="f2-side-link" onClick={()=>setTab("operations")}><Icon name="layers" size={17}/> View activity & workflow <Icon name="chevron" size={16}/></button><button className="f2-side-link" onClick={()=>setTab("files")}><Icon name="folder" size={17}/> Manage attachments <Icon name="chevron" size={16}/></button>{canWrite&&<button className="f2-side-link" onClick={onEdit}><Icon name="pencil" size={17}/> Edit record <Icon name="chevron" size={16}/></button>}{user.role==="admin"&&<><button className="f2-side-link f2-danger-text" onClick={()=>setConfirmDelete(!confirmDelete)}><Icon name="trash" size={17}/> Delete record <Icon name="chevron" size={16}/></button>{confirmDelete&&<div className="f2-confirm"><strong>Delete permanently?</strong><p>Associated files and operational data will also be deleted.</p><div><button className="f2-btn f2-btn-outline" onClick={()=>setConfirmDelete(false)}>Cancel</button><button className="f2-btn f2-btn-danger" disabled={busy} onClick={deleteRecord}>{busy?"Deleting…":"Delete"}</button></div></div>}</>}</section></aside>
  </div>}
 </div>;
}
