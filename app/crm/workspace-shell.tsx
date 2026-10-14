"use client";
import {useEffect,useMemo,useState} from "react";
import {Icon,type IconName} from "@/app/crm-demo/crm-icons";
import {ForgeExecutive} from "@/app/crm-demo/executive-overview";
import {WorkspaceRecord,type RecordPanel} from "./workspace-record";
import {SampleDataDialog} from "@/app/crm-demo/sample-data-dialog";
import {config,dateLabel,menu,modules,money,shortMoney,stageClass,type CrmRecord,type CrmStore,type ModuleKey,type ViewKey} from "@/app/crm-demo/crm-data";
import type {ForgeUser} from "@/lib/forge/security";

type Staff={id:string;name:string;email:string;role:string};
const empty=():CrmStore=>({tenders:[],quotes:[],projects:[],clients:[],tasks:[],documents:[]});
const icons:Record<ViewKey,IconName>={overview:"grid",tenders:"bid",quotes:"receipt",projects:"hardhat",clients:"users",tasks:"check",documents:"folder",insights:"chart"};
const groups=["WORKSPACE","OPERATIONS","RELATIONSHIPS","REPORTING"];
const initial=(name:string)=>name.split(/\s+/).filter(Boolean).map(x=>x[0]).slice(0,2).join("").toUpperCase();
function Status({value}:{value:string}){return <span className={"f2-status "+stageClass(value)}><i/>{value}</span>}
function exportCsv(rows:CrmRecord[],kind:ModuleKey){
 const columns=["id","title","client","owner","status","amount","date","description"];
 const safe=(v:unknown)=>'"'+String(v??"").replace(/"/g,'""').replace(/^[=+\-@]/,"'$&")+'"';
 const csv=[columns.join(","),...rows.map(r=>columns.map(k=>safe(r[k as keyof CrmRecord])).join(","))].join("\r\n");
 const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
 const link=document.createElement("a");link.href=url;link.download="forge-"+kind+".csv";link.click();URL.revokeObjectURL(url);
}
export function ForgeWorkspace({user}:{user:ForgeUser}){
 const [store,setStore]=useState<CrmStore>(()=>empty());
 const [staff,setStaff]=useState<Staff[]>([]);
 const [loading,setLoading]=useState(true),[error,setError]=useState("");
 const [view,setView]=useState<ViewKey>("overview"),[panel,setPanel]=useState<RecordPanel|null>(null);
 const [search,setSearch]=useState(""),[filter,setFilter]=useState("All"),[layout,setLayout]=useState<"table"|"board">("table");
 const [mobileNav,setMobileNav]=useState(false),[showSeeds,setShowSeeds]=useState(false),[showTeam,setShowTeam]=useState(false),[showProfile,setShowProfile]=useState(false);
 const [toast,setToast]=useState<{message:string;tone:"success"|"error"}|null>(null);
 const [today]=useState(()=>new Date());
 const [newStaff,setNewStaff]=useState({name:"",email:"",password:"",role:"editor"}),[busyStaff,setBusyStaff]=useState(false);
 const [password,setPassword]=useState({currentPassword:"",newPassword:"",confirm:""}),[busyPassword,setBusyPassword]=useState(false);
 const notify=(message:string,tone:"success"|"error"="success")=>setToast({message,tone});
 const refresh=async()=>{
  const res=await fetch("/api/forge/records",{cache:"no-store"});
  if(!res.ok)throw Error(res.status===401?"Session expired — please sign in again.":"Could not load organization records");
  const data=await res.json();setStore(data.records as CrmStore);
 };
 useEffect(()=>{
  let dead=false;
  Promise.all([fetch("/api/forge/records",{cache:"no-store"}),fetch("/api/forge/users",{cache:"no-store"})]).then(async([r,s])=>{
   if(!r.ok)throw Error("Unable to load CRM workspace");
   const a=await r.json();if(!dead)setStore(a.records);
   if(s.ok){const b=await s.json();if(!dead)setStaff(b.users||[])}
  }).catch(e=>{if(!dead)setError(e instanceof Error?e.message:"Connection failed")}).finally(()=>{if(!dead)setLoading(false)});
  return()=>{dead=true};
 },[]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(null),4500);return()=>clearTimeout(t)},[toast]);
 const counts=useMemo(()=>Object.fromEntries(modules.map(k=>[k,store[k].length])) as Record<ModuleKey,number>,[store]);
 const openTasks=store.tasks.filter(r=>r.status!=="Done");
 const record=panel?.id?store[panel.module].find(r=>r.id===panel.id):undefined;
 const owners=[...new Set([user.name,...staff.map(s=>s.name)])];
 const navigate=(destination:ViewKey)=>{setView(destination);setPanel(null);setSearch("");setFilter("All");setLayout("table");setMobileNav(false)};
 const open=(kind:ModuleKey,row:CrmRecord)=>{setView(kind);setPanel({module:kind,mode:"view",id:row.id})};
 const create=(kind:ModuleKey)=>{if(user.role==="viewer")return;setView(kind);setPanel({module:kind,mode:"new"})};
 const visible=useMemo(()=>{
  if(view==="overview"||view==="insights")return [];
  const term=search.toLowerCase().trim();
  return store[view].filter(r=>(filter==="All"||r.status===filter)&&(!term||[r.title,r.client,r.id,r.owner,r.description].some(v=>String(v).toLowerCase().includes(term)))).sort((a,b)=>a.date.localeCompare(b.date));
 },[view,store,search,filter]);
 const signOut=async()=>{await fetch("/api/forge/auth/logout",{method:"POST"});window.location.assign("/crm")};
 async function addStaff(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusyStaff(true);
  try{const res=await fetch("/api/forge/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newStaff)});const d=await res.json();if(!res.ok)throw Error(d.error||"Cannot add staff");const users=await fetch("/api/forge/users");if(users.ok)setStaff((await users.json()).users);setNewStaff({name:"",email:"",password:"",role:"editor"});notify("Team member created")}
  catch(e){notify(e instanceof Error?e.message:"Could not add staff","error")}finally{setBusyStaff(false)}
 }
 async function changePassword(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(password.newPassword!==password.confirm){notify("Passwords do not match","error");return}
  setBusyPassword(true);
  try{const res=await fetch("/api/forge/users/change-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(password)});const d=await res.json();if(!res.ok)throw Error(d.error||"Cannot change password");setShowProfile(false);setPassword({currentPassword:"",newPassword:"",confirm:""});notify("Password updated")}
  catch(e){notify(e instanceof Error?e.message:"Unable to change password","error")}finally{setBusyPassword(false)}
 }
 const metrics=view!=="overview"&&view!=="insights"?store[view]:[];
 return <div className="f2-app">
  <aside className={"f2-sidebar "+(mobileNav?"f2-sidebar-open":"")}>
   <div className="f2-brand"><div className="f2-brand-symbol">F<span>.</span></div><div><strong>FORGE</strong><small>CONSTRUCTION OPERATIONS</small></div><button className="f2-mobile-close" onClick={()=>setMobileNav(false)} aria-label="Close navigation"><Icon name="x" size={19}/></button></div>
   <div className="f2-org"><span className="f2-org-logo"><Icon name="layers" size={19}/></span><span><strong>{user.organizationName}</strong><small>Company workspace</small></span><Icon name="down" size={15}/></div>
   <div className="f2-sidebar-scroll">{groups.map(group=><div className="f2-nav-group" key={group}><span>{group}</span>{menu.filter(m=>m.group===group).map(item=><button type="button" key={item.key} onClick={()=>navigate(item.key)} className={"f2-nav-link "+(view===item.key?"active":"")} aria-current={view===item.key?"page":undefined}><Icon name={icons[item.key]} size={18}/><span>{item.label}</span>{item.key!=="overview"&&item.key!=="insights"&&counts[item.key]>0&&<small>{counts[item.key]}</small>}</button>)}</div>)}</div>
   <div className="f2-side-bottom"><button type="button" className="f2-account" onClick={()=>setShowProfile(true)}><span>{initial(user.name)}</span><span><strong>{user.name}</strong><small>{user.role} · My account</small></span><Icon name="settings" size={17}/></button></div>
  </aside>
  {mobileNav&&<button className="f2-backdrop" aria-label="Close menu" onClick={()=>setMobileNav(false)}/>}
  <div className="f2-main-shell">
   <header className="f2-header"><div className="f2-header-left"><button aria-label="Open navigation" className="f2-hamburger" onClick={()=>setMobileNav(true)}><Icon name="menu" size={21}/></button><span className="f2-breadcrumb">FORGE</span><Icon name="chevron" size={14}/><strong>{panel?"Record details":view==="overview"?"Dashboard":view==="insights"?"Reports":config[view].title}</strong></div><div className="f2-header-actions"><span className="f2-online"><i/> Workspace connected</span><button aria-label="Refresh workspace" title="Refresh" onClick={()=>void refresh().then(()=>notify("Records refreshed")).catch(e=>notify(e.message,"error"))}><Icon name="refresh" size={18}/></button><button aria-label="Manage team" title="Manage team" onClick={()=>setShowTeam(true)}><Icon name="users" size={18}/></button><button aria-label="Account settings" onClick={()=>setShowProfile(true)} className="f2-header-avatar">{initial(user.name)}</button></div></header>
   <main className="f2-content">
    {loading?<div className="f2-loader"><span className="f2-spinner"/> Loading your workspace…</div>:error?<div className="f2-error"><Icon name="alert" size={24}/><h2>Workspace unavailable</h2><p>{error}</p><button onClick={()=>window.location.reload()}>Try again</button></div>:panel?
     <WorkspaceRecord key={panel.module+"-"+(panel.id||"new")+"-"+panel.mode} panel={panel} record={record} user={user} owners={owners} onBack={()=>setPanel(null)} onEdit={()=>setPanel({...panel,mode:"edit"})} onRefresh={refresh} onHandover={id=>{setPanel(null);navigate("projects");notify("New delivery project created: "+id);void refresh()}} notify={notify}/>
    :view==="overview"?<ForgeExecutive store={store} organization={user.organizationName} name={user.name} today={today} canEdit={user.role!=="viewer"} onNavigate={navigate} onOpen={open} onCreate={create}/>
    :view==="insights"?<div className="f2-page"><div className="f2-page-heading"><div><span className="f2-eyebrow">BUSINESS INTELLIGENCE</span><h1>Reports & performance</h1><p>Commercial and operational indicators calculated from your company records.</p></div></div><div className="f2-stat-row">{[{label:"Total opportunities",value:store.tenders.length},{label:"Total tender value",value:shortMoney(store.tenders.reduce((x,r)=>x+r.amount,0))},{label:"Contracts in delivery",value:store.projects.filter(r=>r.status!=="Completed").length},{label:"Outstanding actions",value:openTasks.length}].map(x=><div className="f2-stat-card" key={x.label}><span>{x.label}</span><strong>{x.value}</strong></div>)}</div><div className="f2-report-grid"><section className="f2-panel"><div className="f2-panel-header"><h2>Pipeline by stage</h2><span>Number of opportunities</span></div>{config.tenders.statuses.map(s=>{const n=store.tenders.filter(t=>t.status===s).length;return <div key={s} className="f2-report-bar"><span>{s}</span><div><i style={{width:store.tenders.length?100*n/store.tenders.length+"%":"0%"}}/></div><strong>{n}</strong></div>})}</section><section className="f2-panel"><div className="f2-panel-header"><h2>Project health</h2><span>Contract delivery status</span></div>{config.projects.statuses.map(s=><div key={s} className="f2-report-line"><Status value={s}/><strong>{store.projects.filter(p=>p.status===s).length}</strong></div>)}</section></div></div>
    :<div className="f2-page">
     <div className="f2-page-heading"><div><span className="f2-eyebrow">OPERATIONS / {view.toUpperCase()}</span><h1>{config[view].title}</h1><p>{config[view].subtitle}</p></div><div className="f2-page-actions">{user.role==="admin"&&<button className="f2-btn f2-btn-outline" onClick={()=>setShowSeeds(true)}><Icon name="layers" size={16}/> Sample data</button>}{user.role!=="viewer"&&<button className="f2-btn f2-btn-primary" onClick={()=>create(view)}><Icon name="plus" size={17}/>{config[view].button}</button>}</div></div>
     <div className="f2-stat-row">{[{label:"Total records",value:metrics.length},{label:"In progress",value:metrics.filter(r=>!["Done","Completed","Awarded","Declined","Rejected","Approved","Expired"].includes(r.status)).length},{label:modules.slice(0,3).includes(view)?"Total recorded value":"Assigned owners",value:modules.slice(0,3).includes(view)?shortMoney(metrics.reduce((sum,r)=>sum+r.amount,0)):new Set(metrics.map(r=>r.owner)).size}].map(x=><div className="f2-stat-card" key={x.label}><span>{x.label}</span><strong>{x.value}</strong></div>)}</div>
     <section className="f2-panel f2-register"><div className="f2-register-toolbar"><div><strong>{config[view].title}</strong><span>{visible.length} of {metrics.length} records</span></div><div className="f2-table-tools"><label className="f2-search"><Icon name="search" size={18}/><input aria-label="Search records" placeholder="Search by name, reference or client…" value={search} onChange={e=>setSearch(e.target.value)}/></label><label className="f2-select-filter"><Icon name="filter" size={16}/><select aria-label="Filter by stage" value={filter} onChange={e=>setFilter(e.target.value)}><option value="All">All statuses</option>{config[view].statuses.map(s=><option key={s}>{s}</option>)}</select></label><div className="f2-view-switch"><button className={layout==="table"?"active":""} aria-label="Table view" aria-pressed={layout==="table"} onClick={()=>setLayout("table")}><Icon name="menu" size={16}/></button><button className={layout==="board"?"active":""} aria-label="Board view" aria-pressed={layout==="board"} onClick={()=>setLayout("board")}><Icon name="grid" size={16}/></button></div><button className="f2-tool-button" aria-label="Export CSV" title="Export displayed records" onClick={()=>exportCsv(visible,view)}><Icon name="download" size={17}/></button></div></div>
      {layout==="table"?<div className="f2-table-scroll"><table className="f2-table"><thead><tr><th>RECORD</th><th>COMPANY / LINKED TO</th><th>ASSIGNED TO</th><th>STATUS</th><th>DATE</th>{["tenders","quotes","projects"].includes(view)&&<th>VALUE</th>}<th/></tr></thead><tbody>{visible.map(r=><tr key={r.id} onClick={()=>open(view,r)}><td><strong>{r.title}</strong><small>{r.id}{r.isSample?" · SAMPLE":""}</small></td><td>{r.client}</td><td><span className="f2-owner"><i>{initial(r.owner)}</i>{r.owner}</span></td><td><Status value={r.status}/></td><td>{dateLabel(r.date)}</td>{["tenders","quotes","projects"].includes(view)&&<td className="f2-cell-value">{money(r.amount)}</td>}<td><button aria-label={"Open "+r.title} onClick={e=>{e.stopPropagation();open(view,r)}}><Icon name="chevron" size={17}/></button></td></tr>)}</tbody></table>{visible.length===0&&<div className="f2-empty"><Icon name="folder" size={28}/><h3>No records found</h3><p>{metrics.length?"Try clearing your search or status filter.":"Create a record to begin managing this workspace."}</p>{user.role!=="viewer"&&!metrics.length&&<button className="f2-btn f2-btn-primary" onClick={()=>create(view)}>Create {config[view].singular.toLowerCase()}</button>}</div>}</div>
      :<div className="f2-kanban">{config[view].statuses.map(s=><div className="f2-kanban-column" key={s}><header><Status value={s}/><span>{visible.filter(r=>r.status===s).length}</span></header>{visible.filter(r=>r.status===s).map(r=><button key={r.id} className="f2-kanban-card" onClick={()=>open(view,r)}><small>{r.id}</small><strong>{r.title}</strong><span>{r.client}</span><footer><span>{dateLabel(r.date)}</span><Icon name="arrow" size={15}/></footer></button>)}{!visible.some(r=>r.status===s)&&<p>Nothing in this stage</p>}</div>)}</div>}
      <div className="f2-table-footer"><span>Showing {visible.length} records</span><span>Open a record to see its workflow, details and files</span></div>
     </section>
    </div>}
   </main>
  </div>
  {toast&&<div className={"f2-toast "+toast.tone} role="status"><Icon name={toast.tone==="error"?"alert":"check-circle"} size={19}/>{toast.message}<button onClick={()=>setToast(null)} aria-label="Dismiss"><Icon name="x" size={16}/></button></div>}
  {showSeeds&&<SampleDataDialog onClose={()=>setShowSeeds(false)} onLoaded={async()=>{await refresh();setShowSeeds(false);notify("Sample workspace records installed")}}/>}
  {showTeam&&<div className="f2-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowTeam(false)}}><section className="f2-modal" role="dialog" aria-modal="true" aria-label="Team management"><header><div><span className="f2-eyebrow">ADMINISTRATION</span><h2>Team members</h2><p>Access is scoped to your company workspace.</p></div><button onClick={()=>setShowTeam(false)} aria-label="Close"><Icon name="x" size={19}/></button></header><div className="f2-team-list">{staff.map(p=><div key={p.id}><span className="f2-owner"><i>{initial(p.name)}</i><span><strong>{p.name}</strong><small>{p.email}</small></span></span><span className="f2-status neutral">{p.role}</span></div>)}</div>{user.role==="admin"&&<form className="f2-modal-form" onSubmit={addStaff}><h3>Add staff member</h3><label>Full name<input required minLength={2} value={newStaff.name} onChange={e=>setNewStaff({...newStaff,name:e.target.value})}/></label><label>Work email<input required type="email" value={newStaff.email} onChange={e=>setNewStaff({...newStaff,email:e.target.value})}/></label><label>Temporary password<input required minLength={12} type="password" autoComplete="new-password" value={newStaff.password} onChange={e=>setNewStaff({...newStaff,password:e.target.value})}/></label><label>Role<select value={newStaff.role} onChange={e=>setNewStaff({...newStaff,role:e.target.value})}><option value="editor">Editor</option><option value="viewer">Viewer</option><option value="admin">Administrator</option></select></label><button className="f2-btn f2-btn-primary" disabled={busyStaff}>{busyStaff?"Adding…":"Add team member"}</button></form>}</section></div>}
  {showProfile&&<div className="f2-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowProfile(false)}}><section className="f2-modal" role="dialog" aria-modal="true" aria-label="Account settings"><header><div><span className="f2-eyebrow">MY ACCOUNT</span><h2>Account settings</h2><p>{user.email}</p></div><button onClick={()=>setShowProfile(false)} aria-label="Close"><Icon name="x" size={19}/></button></header><form className="f2-modal-form" onSubmit={changePassword}><h3>Change password</h3><label>Current password<input type="password" required autoComplete="current-password" value={password.currentPassword} onChange={e=>setPassword({...password,currentPassword:e.target.value})}/></label><label>New password<input type="password" minLength={12} maxLength={128} required autoComplete="new-password" value={password.newPassword} onChange={e=>setPassword({...password,newPassword:e.target.value})}/></label><label>Confirm password<input type="password" minLength={12} maxLength={128} required autoComplete="new-password" value={password.confirm} onChange={e=>setPassword({...password,confirm:e.target.value})}/></label><button className="f2-btn f2-btn-primary" disabled={busyPassword}>{busyPassword?"Saving…":"Update password"}</button></form><button className="f2-sign-out" onClick={signOut}><Icon name="arrow" size={16}/> Sign out of workspace</button></section></div>}
 </div>;
}
