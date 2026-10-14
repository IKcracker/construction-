"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Icon, type IconName } from "./crm-icons";
import { OperationsWorkbench } from "./operations-workbench";
import { SampleDataDialog } from "./sample-data-dialog";
import { config, dateLabel, menu, modules, money, shortMoney, stageClass, type CrmRecord, type CrmStore, type ModuleKey, type ViewKey } from "./crm-data";
import type {ForgeUser} from "@/lib/forge/security";

const iconName:Record<ViewKey,IconName>={overview:"grid",tenders:"bid",quotes:"receipt",projects:"hardhat",clients:"users",tasks:"check",documents:"folder",insights:"chart"};
type Staff={id:string;name:string;email:string;role:string};
type Attachment={id:string;filename:string;size_bytes:number;content_type:string;created_at:string;uploaded_by:string};
const emptyStore=():CrmStore=>({tenders:[],quotes:[],projects:[],clients:[],tasks:[],documents:[]});
type Dialog={module:ModuleKey;mode:"create"|"view"|"edit";id?:string};
const workspaceMessage="Secure company workspace. Changes are saved in your organization’s PostgreSQL database.";
function Pill({status}:{status:string}){return <span className={`forge-pill forge-pill-${stageClass(status)}`}><i/>{status}</span>}
function shortDate(value:string){return dateLabel(value)}
function avatar(name:string){return name.split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase()}
function formatCsvCell(v:unknown){const s=String(v??"");return '"'+s.replace(/"/g,'""')+'"'}
function makeDefault(module:ModuleKey,owner:string):CrmRecord{
 return {id:"",title:"",client:"",owner,status:config[module].statuses[0],amount:0,date:new Date().toISOString().slice(0,10),description:"",...(module==="projects"?{progress:0}:{})};
}

export function CRMShowcase({user}:{user:ForgeUser}){
 const [store,setStore]=useState<CrmStore>(()=>emptyStore());
 const [staff,setStaff]=useState<Staff[]>([]);
 const [attachments,setAttachments]=useState<Attachment[]>([]);
 const [uploading,setUploading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [newStaff,setNewStaff]=useState({name:"",email:"",password:"",role:"editor"});
 const [showStaff,setShowStaff]=useState(false);
 const [showSeeds,setShowSeeds]=useState(false);
 const [showPassword,setShowPassword]=useState(false);
 const [passwordFields,setPasswordFields]=useState({currentPassword:"",newPassword:"",confirm:""});
 const [passwordBusy,setPasswordBusy]=useState(false);
 const [staffBusy,setStaffBusy]=useState(false);
 const owners=useMemo(()=>[...new Set([user.name,...staff.map(x=>x.name)])],[staff,user.name]);
 const [loaded,setLoaded]=useState(false);
 const [today]=useState(()=>new Date());
 const [active,setActive]=useState<ViewKey>("overview");
 const [query,setQuery]=useState("");
 const [filter,setFilter]=useState("All statuses");
 const [display,setDisplay]=useState<"list"|"board">("list");
 const [drawer,setDrawer]=useState<Dialog|null>(null);
 const [form,setForm]=useState<CrmRecord>(()=>makeDefault("tenders",user.name));
 const [navOpen,setNavOpen]=useState(false);
 const [guide,setGuide]=useState(false);
 const [alerts,setAlerts]=useState(false);
 const [toast,setToast]=useState("");
 const [confirmDelete,setConfirmDelete]=useState(false);

 async function changeOwnPassword(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(passwordBusy)return;
  if(passwordFields.newPassword!==passwordFields.confirm){setToast("New passwords do not match");return}
  setPasswordBusy(true);
  try{
   const res=await fetch("/api/forge/users/change-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({currentPassword:passwordFields.currentPassword,newPassword:passwordFields.newPassword})});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error||"Could not change password");
   setPasswordFields({currentPassword:"",newPassword:"",confirm:""});
   setShowPassword(false);setToast("Your password has been updated");
  }catch(err){setToast(err instanceof Error?err.message:"Unable to change password")}
  finally{setPasswordBusy(false)}
 }
 async function loadRecords(){
  const response=await fetch("/api/forge/records",{cache:"no-store"});
  if(!response.ok)throw new Error(response.status===401?"Session expired. Please sign in again.":"Unable to load CRM records");
  const result=await response.json();
  setStore(result.records as CrmStore);setLoaded(true);
 }
 async function loadStaff(){
  const response=await fetch("/api/forge/users",{cache:"no-store"});
  if(response.ok){const result=await response.json();setStaff(result.users)}
 }
 async function loadAttachments(recordId:string){
  const response=await fetch("/api/forge/attachments?recordId="+encodeURIComponent(recordId),{cache:"no-store"});
  if(response.ok){const result=await response.json();setAttachments(result.attachments)}
 }
 useEffect(()=>{
  let cancelled=false;
  Promise.all([fetch("/api/forge/records",{cache:"no-store"}),fetch("/api/forge/users",{cache:"no-store"})])
   .then(async ([records,users])=>{
    if(!records.ok)throw new Error("Could not load CRM records");
    const data=await records.json();
    if(!cancelled){setStore(data.records);setLoaded(true)}
    if(users.ok){const staffData=await users.json();if(!cancelled)setStaff(staffData.users)}
   }).catch(error=>{if(!cancelled)setToast(error instanceof Error?error.message:"Could not connect to CRM")});
  return ()=>{cancelled=true};
 },[]);
 useEffect(()=>{
  if(!drawer?.id){return}
  let cancelled=false;
  fetch("/api/forge/attachments?recordId="+encodeURIComponent(drawer.id),{cache:"no-store"})
   .then(async r=>r.ok?r.json():{attachments:[]}).then(data=>{if(!cancelled)setAttachments(data.attachments)})
   .catch(()=>{if(!cancelled)setAttachments([])});
  return ()=>{cancelled=true};
 },[drawer?.id]);
 useEffect(()=>{
  if(!toast)return;
  const t=window.setTimeout(()=>setToast(""),3600);
  return ()=>window.clearTimeout(t);
 },[toast]);
 useEffect(()=>{
  const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape"){setDrawer(null);setGuide(false);setAlerts(false);setNavOpen(false);setConfirmDelete(false)}};
  window.addEventListener("keydown",onKey);
  return ()=>window.removeEventListener("keydown",onKey);
 },[]);

 const all=useMemo(()=>modules.flatMap(m=>store[m].map(r=>({...r,module:m}))),[store]);
 const moduleRows=useMemo(()=>active!=="overview"&&active!=="insights"?store[active]:[],[active,store]);
 const visible=useMemo(()=>moduleRows.filter(r=>{
  const q=query.trim().toLowerCase();
  return (filter==="All statuses"||filter===r.status)&&(!q||[r.id,r.title,r.client,r.owner,r.status,r.description].some(v=>String(v).toLowerCase().includes(q)));
 }).sort((a,b)=>a.date.localeCompare(b.date)),[moduleRows,filter,query]);
 const globalResults=useMemo(()=>all.filter(r=>{
  const q=query.trim().toLowerCase();
  return q&&[r.id,r.title,r.client,r.owner,r.status].some(v=>String(v).toLowerCase().includes(q));
 }).slice(0,8),[all,query]);
 const openTenders=store.tenders.filter(r=>!["Awarded","Declined"].includes(r.status));
 const activeProjects=store.projects.filter(r=>!["Completed","On Hold"].includes(r.status));
 const pendingQuotes=store.quotes.filter(r=>!["Approved","Rejected"].includes(r.status));
 const urgentTasks=store.tasks.filter(r=>r.status!=="Done"&&r.date<=new Date(today.getTime()+10*86400000).toISOString().slice(0,10));
 const tendervalue=openTenders.reduce((s,r)=>s+r.amount,0);
 const revenue=store.projects.filter(r=>r.status!=="Completed").reduce((s,r)=>s+r.amount,0);
 const quoteValue=pendingQuotes.reduce((s,r)=>s+r.amount,0);
 const topClients=[...new Set(store.projects.map(r=>r.client))].map(client=>({client,amount:store.projects.filter(r=>r.client===client).reduce((sum,r)=>sum+r.amount,0)})).sort((a,b)=>b.amount-a.amount);
 const stageTotals=config.tenders.statuses.map(s=>({status:s,count:store.tenders.filter(r=>r.status===s).length}));
 const currentRecord=drawer?.id?store[drawer.module].find(r=>r.id===drawer.id):undefined;
 const pageConfig=active!=="overview"&&active!=="insights"?config[active]:null;
 function changeView(view:ViewKey){setActive(view);setQuery("");setFilter("All statuses");setDisplay("list");setNavOpen(false);setAlerts(false)}
 function startForm(module:ModuleKey,record?:CrmRecord,mode:"create"|"view"|"edit"="view"){
  setForm(record?{...record}:makeDefault(module,user.name));
  setDrawer({module,mode,id:record?.id});
  setConfirmDelete(false);
  setAlerts(false);
 }
 async function updateStatus(module:ModuleKey,id:string,status:string){
  try{
   const res=await fetch("/api/forge/records/"+encodeURIComponent(id),{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});
   const body=await res.json();if(!res.ok)throw new Error(body.error||"Status update failed");
   await loadRecords();setForm(f=>f.id===id?{...f,status}:f);setToast("Workflow stage updated");
  }catch(error){setToast(error instanceof Error?error.message:"Status update failed")}
 }
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!drawer||saving)return;
  const moduleKey=drawer.module;
  const record:CrmRecord={...form,title:form.title.trim(),client:form.client.trim(),description:form.description.trim(),amount:Math.max(0,Number(form.amount)||0),progress:moduleKey==="projects"?Math.min(100,Math.max(0,Number(form.progress)||0)):0};
  if(!record.title||!record.client){setToast("A title and organisation are required");return}
  setSaving(true);
  try{
   const creating=drawer.mode==="create";
   const response=await fetch(creating?"/api/forge/records":"/api/forge/records/"+encodeURIComponent(drawer.id||""),{
    method:creating?"POST":"PATCH",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({...record,kind:moduleKey})
   });
   const body=await response.json();if(!response.ok)throw new Error(body.error||"Unable to save record");
   await loadRecords();setDrawer(null);
   setToast(creating?"Record created successfully":"Record saved successfully");
  }catch(error){setToast(error instanceof Error?error.message:"Unable to save record")}
  finally{setSaving(false)}
 }
 async function remove(){
  if(!drawer?.id || user.role!=="admin")return;
  try{
   const response=await fetch("/api/forge/records/"+encodeURIComponent(drawer.id),{method:"DELETE"});
   const result=await response.json();if(!response.ok)throw new Error(result.error||"Unable to delete");
   await loadRecords();setDrawer(null);setConfirmDelete(false);setToast("Record deleted");
  }catch(error){setToast(error instanceof Error?error.message:"Delete failed")}
 }
 async function uploadAttachment(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(!drawer?.id||uploading)return;
  const form=new FormData(event.currentTarget);
  form.set("recordId",drawer.id);
  setUploading(true);
  try{
   const response=await fetch("/api/forge/attachments",{method:"POST",body:form});
   const result=await response.json();if(!response.ok)throw new Error(result.error||"Unable to upload");
   await loadAttachments(drawer.id);
   setToast("File securely uploaded");event.currentTarget.reset();
  }catch(error){setToast(error instanceof Error?error.message:"Upload failed")}
  finally{setUploading(false)}
 }
 async function removeAttachment(id:string){
  if(user.role!=="admin"||!drawer?.id)return;
  const response=await fetch("/api/forge/attachments/"+encodeURIComponent(id),{method:"DELETE"});
  if(response.ok){await loadAttachments(drawer.id);setToast("Attachment deleted")}
  else {const result=await response.json();setToast(result.error||"Unable to delete attachment")}
 }
 async function createStaff(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(staffBusy)return;setStaffBusy(true);
  try{
   const r=await fetch("/api/forge/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newStaff)});
   const data=await r.json();if(!r.ok)throw new Error(data.error||"Unable to add user");
   setNewStaff({name:"",email:"",password:"",role:"editor"});await loadStaff();
   setToast("New staff account created");
  }catch(error){setToast(error instanceof Error?error.message:"Could not create staff account")}
  finally{setStaffBusy(false)}
 }
 function exportCsv(){
  if(!pageConfig||active==="overview"||active==="insights")return;
  const cols=["id","title","client","owner","status","amount","date","description"];
  const csv=[cols.join(","),...visible.map(r=>cols.map(k=>formatCsvCell(r[k as keyof CrmRecord])).join(","))].join("\r\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement("a");
  anchor.href=url;anchor.download="forge-"+active+"-export.csv";anchor.click();
  URL.revokeObjectURL(url);setToast("CSV export downloaded");
 }
 async function refresh(){
  try{await Promise.all([loadRecords(),loadStaff()]);setToast("Workspace refreshed")}
  catch(error){setToast(error instanceof Error?error.message:"Unable to refresh")}
 }
 function recordTable(rows:CrmRecord[],module:ModuleKey){
  return <div className="forge-table-scroll"><table className="forge-table"><thead><tr><th>{config[module].columns[0]}</th><th>{config[module].columns[1]}</th><th>Owner</th><th>Status</th><th>{module==="clients"?"Last touch":module==="tasks"?"Due date":module==="documents"?"Review by":config[module].columns[3]}</th><th className="forge-money-col">{["tenders","quotes","projects"].includes(module)?"Value":""}</th><th aria-label="Actions"/></tr></thead><tbody>
   {rows.map(row=><tr key={row.id} onClick={()=>startForm(module,row)}><td className="forge-row-title"><strong>{row.title}</strong>{row.isSample&&<span className="forge-sample-tag">SAMPLE</span>}<small>{row.id}</small></td><td className="forge-client">{row.client}</td><td><span className="forge-owner"><i>{avatar(row.owner)}</i>{row.owner}</span></td><td><Pill status={row.status}/></td><td className="forge-date">{shortDate(row.date)}</td><td className="forge-money-col">{["tenders","quotes","projects"].includes(module)?money(row.amount):""}</td><td><button className="forge-row-action" title={"Open "+row.title} aria-label={"Open "+row.title} onClick={e=>{e.stopPropagation();startForm(module,row)}}><Icon name="chevron" size={17}/></button></td></tr>)}
   {!rows.length&&<tr><td colSpan={7} className="forge-empty"><Icon name="search" size={26}/><strong>No matching records</strong><span>Try another search or clear your status filter.</span><button onClick={()=>{setQuery("");setFilter("All statuses")}} className="forge-text-button">Clear filters</button></td></tr>}
  </tbody></table></div>;
 }
 function recordBoard(rows:CrmRecord[],module:ModuleKey){
  return <div className="forge-kanban">{config[module].statuses.map(status=><div className="forge-board-col" key={status}><div className="forge-board-col-head"><span><i className={"forge-board-dot "+stageClass(status)}/>{status}</span><b>{rows.filter(r=>r.status===status).length}</b></div><div className="forge-board-cards">{rows.filter(r=>r.status===status).map(row=><button key={row.id} className="forge-board-card" onClick={()=>startForm(module,row)}><small>{row.id}</small><strong>{row.title}</strong><span>{row.client}</span><div><span>{dateLabel(row.date)}</span><Icon name="arrow-right" size={15}/></div></button>)}{!rows.some(r=>r.status===status)&&<div className="forge-board-empty">No records in this stage</div>}</div></div>)}</div>;
 }

 if(!loaded)return <div className="forge-loading"><div className="forge-loading-spin"/>Loading your FORGE workspace…</div>;
 return <div className="forge-app">
  <aside className={`forge-sidebar ${navOpen?"forge-sidebar-open":""}`} aria-label="CRM navigation">
   <div className="forge-brand"><div className="forge-brand-mark"><span>F</span></div><div><strong>FORGE<span className="forge-brand-dot">.</span></strong><small>CONSTRUCTION CRM</small></div><button className="forge-mobile-close" aria-label="Close navigation" onClick={()=>setNavOpen(false)}><Icon name="x"/></button></div>
   <div className="forge-company-switch"><div className="forge-company-icon"><Icon name="layers" size={19}/></div><div><strong>{user.organizationName}</strong><span>Company workspace</span></div><Icon name="down" size={15}/></div>
   <div className="forge-nav-scroll">{["WORKSPACE","OPERATIONS","RELATIONSHIPS","REPORTING"].map(group=><div className="forge-nav-group" key={group}><span className="forge-nav-caption">{group}</span>{menu.filter(item=>item.group===group).map(item=><button key={item.key} className={`forge-nav-item ${active===item.key?"forge-nav-item-active":""}`} onClick={()=>changeView(item.key)} aria-current={active===item.key?"page":undefined}><Icon name={iconName[item.key]} size={18}/><span>{item.label}</span>{item.key==="tenders"&&<small>{openTenders.length}</small>}{item.key==="tasks"&&<small>{urgentTasks.length}</small>}</button>)}</div>)}</div>
   <div className="forge-side-bottom"><button className="forge-side-guide" onClick={()=>setGuide(true)}><span className="forge-side-guide-icon"><Icon name="spark" size={19}/></span><span><strong>Workspace guide</strong><small>Explore your CRM tools</small></span><Icon name="chevron" size={16}/></button><div className="forge-side-creator"><div className="forge-creator-avatar">CT</div><div><strong>{user.name}</strong><small>{user.role.toUpperCase()} · Signed in</small></div><Icon name="check-circle" size={17}/></div></div>
  </aside>
  {navOpen&&<button className="forge-scrim" aria-label="Close navigation" onClick={()=>setNavOpen(false)}/>}
  <div className="forge-workspace">
   <header className="forge-topbar"><div className="forge-top-left"><button className="forge-mobile-menu" aria-label="Open navigation" onClick={()=>setNavOpen(true)}><Icon name="menu" size={22}/></button><span className="forge-breadcrumb">Workspace <Icon name="chevron" size={13}/> <strong>{active==="overview"?"Overview":active==="insights"?"Insights":config[active].title}</strong></span></div>
    <div className="forge-top-actions">{user.role==="admin"&&<button className="forge-seed-toolbar" title="Load fictional showcase records" onClick={()=>setShowSeeds(true)}><Icon name="layers" size={16}/> <span>Sample data</span></button>}<div className="forge-demo-badge"><span/>PRODUCTION CRM</div><button className="forge-top-icon" onClick={()=>setGuide(true)} title="Workspace guide" aria-label="Open workspace guide"><Icon name="info" size={19}/></button><button className="forge-top-icon" onClick={()=>setShowStaff(true)} title="Manage team" aria-label="Manage team"><Icon name="users" size={19}/></button><button className="forge-top-icon" onClick={()=>setShowPassword(true)} title="Change password" aria-label="Change password"><Icon name="shield" size={19}/></button><div className="forge-notification-wrap"><button className="forge-top-icon" onClick={()=>setAlerts(v=>!v)} title="Notifications" aria-label="Open notifications" aria-expanded={alerts}><Icon name="bell" size={19}/>{urgentTasks.length>0&&<i/>}</button>{alerts&&<div className="forge-notif-pop"><div><strong>Attention needed</strong><button onClick={()=>setAlerts(false)} aria-label="Close notifications"><Icon name="x" size={15}/></button></div>{urgentTasks.map(t=><button key={t.id} onClick={()=>{changeView("tasks");startForm("tasks",t)}}><Icon name="alert" size={16}/><span><strong>{t.title}</strong><small>{dateLabel(t.date)} · {t.owner}</small></span></button>)}{!urgentTasks.length&&<p>No pending priority actions.</p>}</div>}</div><button className="forge-top-avatar" title="Sign out" aria-label="Sign out" onClick={async()=>{await fetch("/api/forge/auth/logout",{method:"POST"});window.location.href="/crm"}}>{avatar(user.name)}</button></div>
   </header>

   <main className="forge-main">
    {modules.reduce((n,k)=>n+store[k].filter(x=>x.isSample).length,0)>0&&<div className="forge-sample-banner"><Icon name="layers" size={16}/><span>Sample workspace content is present. These fictional records are for walkthroughs and are not real client projects.</span></div>}
    <div className="forge-notice"><Icon name="info" size={15}/><span><strong>Secure workspace</strong> · {workspaceMessage}</span><button onClick={refresh}>Refresh records <Icon name="refresh" size={14}/></button></div>
    {active==="overview"&&<>
     <div className="forge-page-head forge-dashboard-head"><div><div className="forge-eyebrow"><span/>{today.toLocaleDateString("en-ZA",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).toUpperCase()}</div><h1>Good afternoon, <span>team.</span></h1><p>Here&apos;s what&apos;s happening across your construction pipeline today.</p></div>{user.role!=="viewer"&&<button className="forge-btn forge-btn-primary" onClick={()=>startForm("tenders",undefined,"create")}><Icon name="plus" size={18}/> New opportunity</button>}</div>
     <div className="forge-quick-search"><Icon name="search" size={18}/><input aria-label="Search across the CRM" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the entire workspace by client, tender, project or owner..." />{query&&<button type="button" aria-label="Clear search" onClick={()=>setQuery("")}><Icon name="x" size={17}/></button>}<span>ALL RECORDS</span></div>
     {query&&<div className="forge-card forge-search-results"><div className="forge-card-head"><strong>Matching records</strong><span>{globalResults.length} results</span></div>{globalResults.map(r=><button key={r.id} onClick={()=>{changeView(r.module);startForm(r.module,r)}}><Icon name={iconName[r.module]}/><span><strong>{r.title}</strong><small>{config[r.module].singular} · {r.client}</small></span><Icon name="arrow-right"/></button>)}{!globalResults.length&&<p>No records match your search.</p>}</div>}
     <div className="forge-stats">
      <button className="forge-stat forge-stat-main" onClick={()=>changeView("tenders")}><div><span>OPEN TENDER PIPELINE</span><Icon name="bid" size={20}/></div><strong>{shortMoney(tendervalue)}</strong><p>{openTenders.length} active opportunities <span>↗</span></p><div className="forge-stat-ornament"/></button>
      <button className="forge-stat" onClick={()=>changeView("projects")}><div><span>ACTIVE PROJECTS</span><Icon name="hardhat" size={20}/></div><strong>{activeProjects.length.toString().padStart(2,"0")}</strong><p>{shortMoney(revenue)} in project value</p><div className="forge-stat-line"><i style={{width:"74%"}}/></div></button>
      <button className="forge-stat" onClick={()=>changeView("quotes")}><div><span>OPEN QUOTATIONS</span><Icon name="receipt" size={20}/></div><strong>{pendingQuotes.length.toString().padStart(2,"0")}</strong><p>{shortMoney(quoteValue)} awaiting decision</p><div className="forge-stat-line"><i style={{width:"45%"}}/></div></button>
      <button className="forge-stat" onClick={()=>changeView("tasks")}><div><span>PRIORITY ACTIONS</span><Icon name="clock" size={20}/></div><strong>{urgentTasks.length.toString().padStart(2,"0")}</strong><p>Follow-ups need your attention</p><div className="forge-stat-line forge-line-red"><i style={{width:"65%"}}/></div></button>
     </div>
     <div className="forge-dashboard-two">
      <section className="forge-card forge-overview-pipeline"><div className="forge-card-head"><div><strong>Tender pipeline</strong><span>Current opportunities by stage</span></div><button className="forge-link" onClick={()=>changeView("tenders")}>View pipeline <Icon name="arrow-right" size={16}/></button></div><div className="forge-stage-bars">{stageTotals.filter(t=>t.status!=="Declined").map(t=><div className="forge-stage-row" key={t.status}><span>{t.status}</span><div className="forge-stage-track"><i style={{width:`${Math.max(t.count*23,3)}%`}}/></div><strong>{t.count}</strong></div>)}</div><div className="forge-chart-foot"><span><i/>Opportunity volume</span><span>Organization records · live count</span></div></section>
      <section className="forge-card forge-attention"><div className="forge-card-head"><div><strong>Needs your attention</strong><span>Actions and project watchlist</span></div><span className="forge-count">{urgentTasks.length+store.projects.filter(p=>p.status==="At Risk").length}</span></div><div className="forge-attention-list">{urgentTasks.slice(0,3).map(t=><button key={t.id} onClick={()=>{changeView("tasks");startForm("tasks",t)}}><span className={`forge-attention-icon ${t.status==="Blocked"?"forge-attention-red":""}`}><Icon name={t.status==="Blocked"?"alert":"calendar"} size={17}/></span><span><strong>{t.title}</strong><small>{t.owner} · Due {dateLabel(t.date)}</small></span><Icon name="chevron" size={16}/></button>)}{store.projects.filter(p=>p.status==="At Risk").slice(0,1).map(p=><button key={p.id} onClick={()=>{changeView("projects");startForm("projects",p)}}><span className="forge-attention-icon forge-attention-red"><Icon name="alert" size={17}/></span><span><strong>{p.title}</strong><small>Project flagged at risk · {p.progress}% complete</small></span><Icon name="chevron" size={16}/></button>)}</div><button className="forge-attention-footer" onClick={()=>changeView("tasks")}>Open task workspace <Icon name="arrow-right" size={16}/></button></section>
     </div>
     <div className="forge-dashboard-two forge-dashboard-bottom">
      <section className="forge-card forge-project-snapshot"><div className="forge-card-head"><div><strong>Project delivery</strong><span>Active site portfolio</span></div><button className="forge-link" onClick={()=>changeView("projects")}>View projects <Icon name="arrow-right" size={16}/></button></div><div className="forge-project-list">{store.projects.filter(p=>p.status!=="Completed").slice(0,3).map(p=><button key={p.id} onClick={()=>{changeView("projects");startForm("projects",p)}}><div className="forge-project-list-title"><div><strong>{p.title}</strong><span>{p.client}</span></div><Pill status={p.status}/></div><div className="forge-progress-label"><span>Completion</span><strong>{p.progress||0}%</strong></div><div className="forge-progress"><i style={{width:(p.progress||0)+"%",background:p.status==="At Risk"?"#f49d53":undefined}}/></div></button>)}</div></section>
      <section className="forge-card forge-recent"><div className="forge-card-head"><div><strong>Recently tracked</strong><span>Latest records in your workspace</span></div><Icon name="layers" size={19}/></div>{[...store.tenders.slice(0,2).map(r=>({r,m:"tenders" as ModuleKey})),...store.quotes.slice(0,2).map(r=>({r,m:"quotes" as ModuleKey}))].map(({r,m})=><button key={r.id} onClick={()=>{changeView(m);startForm(m,r)}}><span className="forge-recent-icon"><Icon name={iconName[m]} size={18}/></span><span><strong>{r.title}</strong><small>{r.id} · {r.client}</small></span><Pill status={r.status}/></button>)}</section>
     </div>
     <div className="forge-foot-note"><Icon name="shield" size={17}/> Authorized workspace. Company data is stored in PostgreSQL. <span>FORGE by Code Tech Agency</span></div>
    </>}
    {pageConfig&&active!=="overview"&&active!=="insights"&&<>
     <div className="forge-page-head"><div><div className="forge-eyebrow">WORKSPACE / {active.toUpperCase()}</div><h1>{pageConfig.title}</h1><p>{pageConfig.subtitle}</p></div>{user.role!=="viewer"&&<button className="forge-btn forge-btn-primary" onClick={()=>startForm(active,undefined,"create")}><Icon name="plus" size={18}/>{pageConfig.button}</button>}</div>
     <div className="forge-module-summary"><div><span>TOTAL RECORDS</span><strong>{store[active].length}</strong></div><div><span>ACTIVE / OPEN</span><strong>{store[active].filter(r=>!["Completed","Approved","Done","Rejected","Declined","Expired"].includes(r.status)).length}</strong></div><div><span>{["tenders","quotes","projects"].includes(active)?"TOTAL VALUE":"TEAM OWNERS"}</span><strong>{["tenders","quotes","projects"].includes(active)?shortMoney(store[active].reduce((s,r)=>s+r.amount,0)):new Set(store[active].map(r=>r.owner)).size}</strong></div></div>
     <section className="forge-card forge-module-table"><div className="forge-list-toolbar"><div className="forge-list-label"><strong>All {pageConfig.title.toLowerCase()}</strong><span>{visible.length} records</span></div><div className="forge-list-controls"><label className="forge-searchbox"><Icon name="search" size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search records..." aria-label="Search records"/></label><label className="forge-filter"><Icon name="filter" size={16}/><select aria-label="Filter by status" value={filter} onChange={e=>setFilter(e.target.value)}><option>All statuses</option>{pageConfig.statuses.map(status=><option key={status}>{status}</option>)}</select></label><div className="forge-view-buttons"><button aria-label="Table view" aria-pressed={display==="list"} className={display==="list"?"active":""} onClick={()=>setDisplay("list")}><Icon name="menu" size={18}/></button><button aria-label="Board view" aria-pressed={display==="board"} className={display==="board"?"active":""} onClick={()=>setDisplay("board")}><Icon name="grid" size={17}/></button></div><button className="forge-export" onClick={exportCsv} title="Export records as CSV"><Icon name="download" size={18}/><span>Export</span></button></div></div>
     {display==="list"?recordTable(visible,active):recordBoard(visible,active)}
     <div className="forge-table-foot"><span>Showing {visible.length} of {store[active].length} records</span><span>Open any record to view details, edit or advance its stage</span></div></section>
     <div className="forge-module-help"><span className="forge-module-help-icon"><Icon name="info" size={19}/></span><div><strong>Connected to your organization workspace.</strong><p>Changes are saved to PostgreSQL and visible to authorized team members. Access depends on your assigned role.</p></div><button onClick={()=>setGuide(true)}>Learn more <Icon name="arrow-right" size={16}/></button></div>
    </>}
    {active==="insights"&&<>
     <div className="forge-page-head"><div><div className="forge-eyebrow">REPORTING / BUSINESS INTELLIGENCE</div><h1>Operational insights</h1><p>A connected view of your organization’s commercial and project activity.</p></div><button className="forge-btn forge-btn-light" onClick={()=>changeView("overview")}><Icon name="grid" size={17}/> Back to overview</button></div>
     <div className="forge-insight-stats"><div><span>TENDER OPPORTUNITIES</span><strong>{store.tenders.length}</strong><small>{shortMoney(store.tenders.reduce((s,r)=>s+r.amount,0))} indicative pipeline</small></div><div><span>QUOTATIONS APPROVED</span><strong>{store.quotes.filter(r=>r.status==="Approved").length}</strong><small>Based on recorded transactions</small></div><div><span>DELIVERY PROGRESS</span><strong>{Math.round(store.projects.reduce((s,p)=>s+(p.progress||0),0)/Math.max(1,store.projects.length))}%</strong><small>Mean across current projects</small></div><div><span>OPEN ACTIONS</span><strong>{store.tasks.filter(t=>t.status!=="Done").length}</strong><small>Awaiting completion</small></div></div>
     <div className="forge-insight-grid"><section className="forge-card"><div className="forge-card-head"><div><strong>Tender stage distribution</strong><span>Opportunity count by current status</span></div><Icon name="chart" size={20}/></div><div className="forge-stage-bars forge-insight-bars">{stageTotals.map(s=><div className="forge-stage-row" key={s.status}><span>{s.status}</span><div className="forge-stage-track"><i style={{width:Math.max(s.count*23,3)+"%"}}/></div><strong>{s.count}</strong></div>)}</div></section><section className="forge-card"><div className="forge-card-head"><div><strong>Project health</strong><span>Status mix across active site records</span></div><Icon name="hardhat" size={20}/></div><div className="forge-donut-box"><div className="forge-donut" style={{background:`conic-gradient(#36a386 0 ${store.projects.filter(r=>r.status==="Active").length/Math.max(1,store.projects.length)*100}%,#efa35c 0 ${store.projects.filter(r=>["Active","At Risk"].includes(r.status)).length/Math.max(1,store.projects.length)*100}%,#cbd5e1 0 100%)`}}><div><strong>{store.projects.length}</strong><span>projects</span></div></div><div className="forge-donut-legend">{[["#36a386","Active"],["#efa35c","At Risk"],["#cbd5e1","Other"]].map(([color,label])=><div key={label}><i style={{background:color}}/>{label}</div>)}</div></div></section></div>
     <section className="forge-card forge-client-ranking"><div className="forge-card-head"><div><strong>Project value by client</strong><span>Distribution of recorded contract values</span></div><Icon name="briefcase" size={19}/></div>{topClients.map((c,i)=><div className="forge-ranking" key={c.client}><span>{String(i+1).padStart(2,"0")}</span><strong>{c.client}</strong><div><i style={{width:c.amount/Math.max(...topClients.map(x=>x.amount),1)*100+"%"}}/></div><b>{shortMoney(c.amount)}</b></div>)}</section>
     <div className="forge-foot-note"><Icon name="info" size={17}/> Insights recalculate from your organization’s stored business records.</div>
    </>}
   </main>
  </div>
  {toast&&<div className="forge-toast" role="status"><Icon name="check-circle" size={18}/>{toast}<button onClick={()=>setToast("")} aria-label="Dismiss notification"><Icon name="x" size={15}/></button></div>}
  {showSeeds&&<SampleDataDialog onClose={()=>setShowSeeds(false)} onLoaded={async()=>{await loadRecords();setShowSeeds(false);setToast("40 fictional construction records added to your workspace")}}/>}
  {showPassword&&<div className="forge-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setShowPassword(false)}}><div className="forge-dialog forge-staff-dialog" role="dialog" aria-modal="true" aria-label="Change password"><div className="forge-dialog-head"><span className="forge-guide-badge"><Icon name="shield" size={16}/> ACCOUNT SECURITY</span><button onClick={()=>setShowPassword(false)} aria-label="Close password settings"><Icon name="x" size={19}/></button></div><h2>Change password</h2><p>Update your password without leaving your CRM workspace.</p><form className="forge-staff-form" onSubmit={changeOwnPassword}><label>Current password<input type="password" required autoComplete="current-password" value={passwordFields.currentPassword} onChange={e=>setPasswordFields({...passwordFields,currentPassword:e.target.value})}/></label><label>New password (12+ characters)<input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={passwordFields.newPassword} onChange={e=>setPasswordFields({...passwordFields,newPassword:e.target.value})}/></label><label>Confirm new password<input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={passwordFields.confirm} onChange={e=>setPasswordFields({...passwordFields,confirm:e.target.value})}/></label><button className="forge-btn forge-btn-primary" disabled={passwordBusy} type="submit">{passwordBusy?"Updating…":"Update password"}</button></form></div></div>}
  {showStaff&&<div className="forge-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setShowStaff(false)}}><div className="forge-dialog forge-staff-dialog" role="dialog" aria-modal="true" aria-label="Team management"><div className="forge-dialog-head"><span className="forge-guide-badge"><Icon name="users" size={16}/> COMPANY TEAM</span><button onClick={()=>setShowStaff(false)} aria-label="Close team management"><Icon name="x" size={19}/></button></div><h2>Team members</h2><p>Manage staff access to your organization&apos;s construction records.</p><div className="forge-staff-list">{staff.map(person=><div key={person.id}><span className="forge-owner"><i>{avatar(person.name)}</i><span><strong>{person.name}</strong><small>{person.email}</small></span></span><span className="forge-pill forge-pill-neutral">{person.role}</span></div>)}</div>{user.role==="admin"&&<form className="forge-staff-form" onSubmit={createStaff}><h3>Add a staff account</h3><label>Name<input required minLength={2} value={newStaff.name} onChange={e=>setNewStaff({...newStaff,name:e.target.value})}/></label><label>Work email<input required type="email" value={newStaff.email} onChange={e=>setNewStaff({...newStaff,email:e.target.value})}/></label><label>Temporary password (12+ characters)<input required type="password" minLength={12} autoComplete="new-password" value={newStaff.password} onChange={e=>setNewStaff({...newStaff,password:e.target.value})}/></label><label>Access level<select value={newStaff.role} onChange={e=>setNewStaff({...newStaff,role:e.target.value})}><option value="editor">Editor — manage records</option><option value="viewer">Viewer — view records only</option><option value="admin">Admin — all access</option></select></label><button disabled={staffBusy} type="submit" className="forge-btn forge-btn-primary">{staffBusy?"Adding…":"Add team member"}</button></form>}</div></div>}
  {guide&&<div className="forge-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setGuide(false)}}><div className="forge-dialog forge-guide" role="dialog" aria-modal="true" aria-label="Showcase guide"><div className="forge-dialog-head"><span className="forge-guide-badge"><Icon name="spark" size={16}/> PRODUCT TOUR</span><button aria-label="Close guide" onClick={()=>setGuide(false)}><Icon name="x"/></button></div><h2>Welcome to FORGE.</h2><p>Your construction CRM connects tenders, quotations, projects, team actions and document control in one secure workspace.</p><div className="forge-guide-steps"><div><i><Icon name="bid" size={20}/></i><span><strong>01 · Qualify opportunities</strong><small>Review tender status and open an opportunity record.</small></span></div><div><i><Icon name="receipt" size={20}/></i><span><strong>02 · Track estimates</strong><small>Create a quotation and update its commercial stage.</small></span></div><div><i><Icon name="hardhat" size={20}/></i><span><strong>03 · Monitor delivery</strong><small>Inspect project health and completion milestones.</small></span></div><div><i><Icon name="chart" size={20}/></i><span><strong>04 · See the bigger picture</strong><small>Use the Insights page to review real metrics from saved records.</small></span></div></div><div className="forge-guide-actions"><button className="forge-btn forge-btn-light" onClick={refresh}><Icon name="refresh" size={17}/> Refresh workspace</button><button className="forge-btn forge-btn-primary" onClick={()=>{setGuide(false);changeView("tenders")}}>Explore tenders <Icon name="arrow-right" size={17}/></button></div><small className="forge-guide-disclaimer">{workspaceMessage} Your session is private and permission-controlled.</small></div></div>}
  {drawer&&<div className="forge-overlay forge-drawer-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setDrawer(null)}}><aside className="forge-drawer" role="dialog" aria-modal="true" aria-label={drawer.mode==="create"?"Add "+config[drawer.module].singular:form.title}><div className="forge-drawer-header"><div><div className="forge-eyebrow">{config[drawer.module].title.toUpperCase()} / {drawer.mode==="create"?"NEW RECORD":form.id}</div><h2>{drawer.mode==="create"?"New "+config[drawer.module].singular:drawer.mode==="edit"?"Edit record":form.title}</h2></div><button onClick={()=>setDrawer(null)} aria-label="Close details"><Icon name="x" size={20}/></button></div>
    {drawer.mode==="view"&&currentRecord?<div className="forge-record-detail"><div className="forge-detail-status"><Pill status={currentRecord.status}/>{currentRecord.isSample&&<span className="forge-sample-tag">FICTIONAL SAMPLE</span>}<span>{currentRecord.id}</span></div><div className="forge-detail-price">{["tenders","quotes","projects"].includes(drawer.module)?money(currentRecord.amount):config[drawer.module].singular}<small>{["tenders","quotes","projects"].includes(drawer.module)?"Recorded value":"Record type"}</small></div><div className="forge-detail-card"><h3>Record overview</h3><div><span>Organisation / Linked to</span><strong>{currentRecord.client}</strong></div><div><span>Record owner</span><strong>{currentRecord.owner}</strong></div><div><span>Relevant date</span><strong>{dateLabel(currentRecord.date)}</strong></div>{drawer.module==="projects"&&<div><span>Completion</span><strong>{currentRecord.progress||0}%</strong></div>}</div><div className="forge-detail-description"><h3>Scope & notes</h3><p>{currentRecord.description||"No additional notes provided."}</p></div><div className="forge-attachments"><h3>Attachments <span>{attachments.length}</span></h3>
  <p>Upload and download actual PDF, PNG or JPEG documents (up to 4 MB).</p>
  {attachments.map(file=><div key={file.id} className="forge-attached-file"><Icon name="file" size={18}/><div><strong>{file.filename}</strong><small>{(file.size_bytes/1024).toFixed(0)} KB · {file.uploaded_by}</small></div><a href={"/api/forge/attachments/"+encodeURIComponent(file.id)} title={"Download "+file.filename}><Icon name="download" size={16}/></a>{user.role==="admin"&&<button aria-label={"Delete "+file.filename} onClick={()=>removeAttachment(file.id)}><Icon name="trash" size={16}/></button>}</div>)}
  {user.role!=="viewer"&&<form onSubmit={uploadAttachment}><input required name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" aria-label="Choose an attachment"/><button disabled={uploading} className="forge-btn forge-btn-light" type="submit"><Icon name="plus" size={15}/>{uploading?"Uploading…":"Attach file"}</button></form>}
 </div><OperationsWorkbench id={currentRecord.id} kind={drawer.module} status={currentRecord.status} canEdit={user.role!=="viewer"} onChanged={loadRecords} onHandover={projectId=>{setDrawer(null);changeView("projects");setToast("Delivery project created: "+projectId);void loadRecords()}}/><div className="forge-detail-stage"><label htmlFor="forge-stage-field">Advance workflow stage</label><select id="forge-stage-field" value={currentRecord.status} disabled={user.role==="viewer"} onChange={e=>updateStatus(drawer.module,currentRecord.id,e.target.value)}>{config[drawer.module].statuses.map(s=><option key={s}>{s}</option>)}</select><p>Stage changes update the dashboard and reporting metrics immediately.</p></div><div className="forge-drawer-bottom">{user.role!=="viewer"&&<button className="forge-btn forge-btn-light" onClick={()=>startForm(drawer.module,currentRecord,"edit")}><Icon name="pencil" size={17}/> Edit record</button>}{user.role==="admin"&&<button className="forge-delete-btn" onClick={()=>setConfirmDelete(true)} aria-label="Delete record"><Icon name="trash" size={19}/></button>}</div>{confirmDelete&&<div className="forge-delete-confirm"><strong>Delete this record permanently?</strong><p>This deletes the record and its attachments for your entire team.</p><div><button className="forge-btn forge-btn-light" onClick={()=>setConfirmDelete(false)}>Cancel</button><button className="forge-btn forge-btn-danger" onClick={remove}>Delete record</button></div></div>}</div>:<form className="forge-record-form" onSubmit={save}><label>Title / Record name *<input autoFocus required maxLength={120} placeholder={config[drawer.module].placeholder} value={form.title} onChange={e=>setForm(v=>({...v,title:e.target.value}))}/></label><label>Client / Linked organisation *<input required maxLength={120} placeholder="Company or related project" value={form.client} onChange={e=>setForm(v=>({...v,client:e.target.value}))}/></label><div className="forge-form-grid"><label>Owner<select value={form.owner} onChange={e=>setForm(v=>({...v,owner:e.target.value}))}>{!owners.includes(form.owner)&&<option>{form.owner}</option>}{owners.map(o=><option key={o}>{o}</option>)}</select></label><label>Stage<select value={form.status} onChange={e=>setForm(v=>({...v,status:e.target.value}))}>{config[drawer.module].statuses.map(o=><option key={o}>{o}</option>)}</select></label></div><div className="forge-form-grid"><label>{drawer.module==="tasks"?"Due date":drawer.module==="tenders"?"Closing date":"Target / follow-up date"}<input type="date" required value={form.date} onChange={e=>setForm(v=>({...v,date:e.target.value}))}/></label>{["tenders","quotes","projects"].includes(drawer.module)?<label>Estimated value (ZAR)<input type="number" min="0" step="1" value={form.amount} onChange={e=>setForm(v=>({...v,amount:Number(e.target.value)}))}/></label>:<label>Reference ID<input value={form.id||"Auto-generated"} disabled/></label>}</div>{drawer.module==="projects"&&<label>Completion (%)<input type="number" min="0" max="100" value={form.progress??0} onChange={e=>setForm(v=>({...v,progress:Number(e.target.value)}))}/></label>}<label>Scope / Description<textarea value={form.description} maxLength={1600} rows={5} onChange={e=>setForm(v=>({...v,description:e.target.value}))} placeholder="Notes, next steps and important context..."/></label><div className="forge-form-note"><Icon name="info" size={16}/> Changes are saved to your company database and attributed to your user account.</div><div className="forge-drawer-bottom"><button type="button" className="forge-btn forge-btn-light" onClick={()=>{if(drawer.mode==="edit"&&currentRecord)startForm(drawer.module,currentRecord);else setDrawer(null)}}>Cancel</button><button disabled={saving} type="submit" className="forge-btn forge-btn-primary"><Icon name="check" size={17}/> {saving?"Saving…":drawer.mode==="create"?"Create record":"Save changes"}</button></div></form>}
   </aside></div>}
 </div>;
}
