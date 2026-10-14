"use client";
import {useMemo} from "react";
import {Icon} from "./crm-icons";
import {dateLabel,money,shortMoney,stageClass,type CrmRecord,type CrmStore,type ModuleKey,type ViewKey} from "./crm-data";

type Props={store:CrmStore;organization:string;name:string;today:Date;canEdit:boolean;onNavigate:(page:ViewKey)=>void;onOpen:(module:ModuleKey,record:CrmRecord)=>void;onCreate:(module:ModuleKey)=>void};
const workingStatuses=["New","Qualification","In Preparation","Submitted"];
function Status({value}:{value:string}){return <span className={"forge-executive-pill "+stageClass(value)}><i/>{value}</span>}
export function ForgeExecutive({store,organization,name,today,canEdit,onNavigate,onOpen,onCreate}:Props){
 const date=today.toISOString().slice(0,10);
 const activeTenders=store.tenders.filter(r=>workingStatuses.includes(r.status));
 const bidsDue=[...activeTenders].filter(r=>r.date>=date).sort((a,b)=>a.date.localeCompare(b.date));
 const overdue=store.tasks.filter(r=>r.status!=="Done"&&r.date<date).sort((a,b)=>a.date.localeCompare(b.date));
 const upcomingTasks=store.tasks.filter(r=>r.status!=="Done"&&r.date>=date).sort((a,b)=>a.date.localeCompare(b.date));
 const delivery=store.projects.filter(r=>r.status!=="Completed");
 const risks=delivery.filter(r=>r.status==="At Risk");
 const awaitingQuotes=store.quotes.filter(r=>["Sent","Under Review"].includes(r.status));
 const tenderValue=activeTenders.reduce((s,r)=>s+r.amount,0);
 const projectValue=delivery.reduce((s,r)=>s+r.amount,0);
 const pendingQuoteValue=awaitingQuotes.reduce((s,r)=>s+r.amount,0);
 const priority=[
  ...risks.map(r=>({module:"projects" as ModuleKey,record:r,flag:"PROJECT AT RISK",tone:"risk" as const})),
  ...overdue.map(r=>({module:"tasks" as ModuleKey,record:r,flag:"OVERDUE TASK",tone:"risk" as const})),
  ...bidsDue.filter(r=>new Date(r.date+"T12:00:00").getTime()-today.getTime()<=7*86400000).map(r=>({module:"tenders" as ModuleKey,record:r,flag:"BID DUE SOON",tone:"warning" as const}))
 ].slice(0,5);
 const stageCount=useMemo(()=>["New","Qualification","In Preparation","Submitted","Awarded"].map(status=>({status,count:store.tenders.filter(r=>r.status===status).length})),[store.tenders]);
 const totalCount=store.tenders.length;
 const topProjects=[...delivery].sort((a,b)=>(a.status==="At Risk"?-1:0)-(b.status==="At Risk"?-1:0)).slice(0,4);
 const checklist=([{key:"tenders",title:"Register tender opportunities",note:"Capture opportunities, deadlines and bid requirements",isDone:store.tenders.length>0},{key:"quotes",title:"Build your first commercial estimate",note:"Price work using the itemised bill of quantities",isDone:store.quotes.length>0},{key:"projects",title:"Create a project delivery plan",note:"Manage milestones, team and progress",isDone:store.projects.length>0}] as const);
 const hasRecords=Object.values(store).some(rows=>rows.length>0);
 const firstName=name.split(" ")[0]||"team";
 return <div className="forge-executive">
  <div className="forge-exec-heading">
   <div><div className="forge-exec-kicker"><span className="forge-exec-kicker-line"/> OPERATIONS / {organization.toUpperCase()}</div><h1>Operations overview</h1><p>{today.toLocaleDateString("en-ZA",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} <span className="forge-exec-separator">·</span> Welcome back, {firstName}.</p></div>
   <div className="forge-exec-heading-actions"><button type="button" onClick={()=>onNavigate("insights")} className="forge-exec-outline"><Icon name="chart" size={17}/> View reports</button>{canEdit&&<button type="button" onClick={()=>onCreate("tenders")} className="forge-exec-primary"><Icon name="plus" size={17}/> New tender</button>}</div>
  </div>
  {!hasRecords&&<div className="forge-exec-onboarding"><div className="forge-exec-onboard-heading"><div><span>GET STARTED</span><h2>Your workspace is ready to use.</h2><p>Start with a real opportunity, build a quotation and bring awarded work into project delivery.</p></div><span className="forge-exec-onboard-progress">0 / 3 SET UP</span></div><div className="forge-exec-steps">{checklist.map((step,i)=><button key={step.key} type="button" onClick={()=>canEdit?onCreate(step.key):onNavigate(step.key)}><span>{String(i+1).padStart(2,"0")}</span><div><strong>{step.title}</strong><small>{step.note}</small></div><Icon name="arrow-right" size={17}/></button>)}</div></div>}
  <div className="forge-exec-metrics">
   <button type="button" onClick={()=>onNavigate("tenders")} className="forge-exec-metric"><span className="forge-exec-metric-head"><span>ACTIVE BID PIPELINE</span><Icon name="bid" size={19}/></span><strong>{shortMoney(tenderValue)}</strong><span className="forge-exec-metric-foot">{activeTenders.length} open tenders <Icon name="arrow-right" size={14}/></span></button>
   <button type="button" onClick={()=>onNavigate("quotes")} className="forge-exec-metric"><span className="forge-exec-metric-head"><span>QUOTES AWAITING DECISION</span><Icon name="receipt" size={19}/></span><strong>{shortMoney(pendingQuoteValue)}</strong><span className="forge-exec-metric-foot">{awaitingQuotes.length} pending customer / internal review <Icon name="arrow-right" size={14}/></span></button>
   <button type="button" onClick={()=>onNavigate("projects")} className="forge-exec-metric"><span className="forge-exec-metric-head"><span>PROJECTS IN DELIVERY</span><Icon name="hardhat" size={19}/></span><strong>{delivery.length.toString().padStart(2,"0")}</strong><span className="forge-exec-metric-foot">{shortMoney(projectValue)} in recorded project value <Icon name="arrow-right" size={14}/></span></button>
   <button type="button" onClick={()=>onNavigate("tasks")} className={"forge-exec-metric "+(overdue.length?"forge-exec-metric-warning":"")}><span className="forge-exec-metric-head"><span>ACTIONS OVERDUE</span><Icon name="clock" size={19}/></span><strong>{String(overdue.length).padStart(2,"0")}</strong><span className="forge-exec-metric-foot">{overdue.length?"Review outstanding assignments":"No overdue tasks"} <Icon name="arrow-right" size={14}/></span></button>
  </div>
  <div className="forge-exec-content-grid">
   <section className="forge-exec-panel forge-exec-priority">
    <div className="forge-exec-panel-heading"><div><span className="forge-exec-section-kicker">ACTION CENTRE</span><h2>Needs attention</h2><p>Items requiring a decision or follow-up.</p></div><span className="forge-exec-count">{priority.length}</span></div>
    <div className="forge-exec-items">{priority.length?priority.map(item=><button key={item.record.id} type="button" onClick={()=>onOpen(item.module,item.record)} className="forge-exec-attention-row"><span className={"forge-exec-attention-mark "+item.tone}><Icon name={item.tone==="risk"?"alert":"calendar"} size={17}/></span><span className="forge-exec-attention-info"><span className="forge-exec-attention-flag">{item.flag}</span><strong>{item.record.title}</strong><small>{item.record.client} · {item.module==="tasks"?"Due ":"Target "}{dateLabel(item.record.date)}</small></span><Icon name="chevron" size={17}/></button>):<div className="forge-exec-no-items"><Icon name="check-circle" size={24}/><strong>Nothing urgent right now</strong><span>At-risk projects, overdue actions and imminent tender deadlines will appear here.</span></div>}</div>
    <button className="forge-exec-panel-footer" type="button" onClick={()=>onNavigate("tasks")}>Open task register <Icon name="arrow-right" size={16}/></button>
   </section>
   <section className="forge-exec-panel">
    <div className="forge-exec-panel-heading"><div><span className="forge-exec-section-kicker">COMMERCIAL</span><h2>Tender pipeline</h2><p>Opportunity volume at each stage.</p></div><button type="button" aria-label="Open tenders" className="forge-exec-card-link" onClick={()=>onNavigate("tenders")}><Icon name="arrow-right" size={18}/></button></div>
    <div className="forge-exec-funnel">{stageCount.map((stage,i)=><button key={stage.status} type="button" onClick={()=>onNavigate("tenders")}><span className="forge-exec-stage-name"><span>{String(i+1).padStart(2,"0")}</span>{stage.status}</span><span className="forge-exec-stage-track"><i style={{width:totalCount?Math.max(0,100*stage.count/totalCount)+"%":"0%"}}/></span><b>{stage.count}</b></button>)}</div>
    <div className="forge-exec-chart-note"><span>{totalCount} tenders registered</span><span>{store.tenders.filter(r=>r.status==="Awarded").length} awarded</span></div>
   </section>
  </div>
  <div className="forge-exec-content-grid forge-exec-bottom">
   <section className="forge-exec-panel"><div className="forge-exec-panel-heading"><div><span className="forge-exec-section-kicker">DELIVERY</span><h2>Project performance</h2><p>Milestone progress and project health.</p></div><button type="button" className="forge-exec-card-link" aria-label="Open projects" onClick={()=>onNavigate("projects")}><Icon name="arrow-right" size={18}/></button></div>
    <div className="forge-exec-projects">{topProjects.length?topProjects.map(p=><button type="button" key={p.id} onClick={()=>onOpen("projects",p)}><span className="forge-exec-project-top"><strong>{p.title}</strong><Status value={p.status}/></span><span className="forge-exec-project-client">{p.client} · {money(p.amount)}</span><span className="forge-exec-progress-label"><span>Completion</span><b>{p.progress||0}%</b></span><span className="forge-exec-progress"><i style={{width:Math.max(0,Math.min(100,p.progress||0))+"%"}}/></span></button>):<div className="forge-exec-no-items"><Icon name="hardhat" size={24}/><strong>No active projects yet</strong><span>Planning and active contracts will be shown here.</span></div>}</div>
   </section>
   <section className="forge-exec-panel"><div className="forge-exec-panel-heading"><div><span className="forge-exec-section-kicker">SCHEDULE</span><h2>Upcoming deadlines</h2><p>Tenders and team actions coming due.</p></div><button className="forge-exec-card-link" type="button" aria-label="Open task register" onClick={()=>onNavigate("tasks")}><Icon name="arrow-right" size={18}/></button></div>
    <div className="forge-exec-schedule">{[...bidsDue.slice(0,4).map(r=>({module:"tenders" as ModuleKey,record:r})),...upcomingTasks.slice(0,4).map(r=>({module:"tasks" as ModuleKey,record:r}))].sort((a,b)=>a.record.date.localeCompare(b.record.date)).slice(0,6).map(({module,record})=><button type="button" key={record.id} onClick={()=>onOpen(module,record)}><span className="forge-exec-calendar-date"><strong>{new Date(record.date+"T12:00:00").toLocaleDateString("en-ZA",{day:"2-digit"})}</strong><small>{new Date(record.date+"T12:00:00").toLocaleDateString("en-ZA",{month:"short"}).toUpperCase()}</small></span><span className="forge-exec-schedule-title"><strong>{record.title}</strong><small>{module==="tenders"?"Tender closing":"Action due"} · {record.client}</small></span><Icon name="chevron" size={16}/></button>)}{!bidsDue.length&&!upcomingTasks.length&&<div className="forge-exec-no-items"><Icon name="calendar" size={24}/><strong>No upcoming deadlines</strong><span>Plan tender closings and assigned follow-ups to see the schedule.</span></div>}</div>
   </section>
  </div>
  <div className="forge-exec-foot"><Icon name="shield" size={15}/> Your organization’s operational records are stored in PostgreSQL. Sample records, where present, remain clearly labelled. <span>FORGE · Code Tech Agency</span></div>
 </div>;
}
