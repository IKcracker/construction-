"use client";
import {useEffect,useState,type FormEvent} from "react";
import {Icon} from "./crm-icons";
import {money} from "./crm-data";
type Requirement={id:string;title:string;completed:boolean};
type Line={id:string;description:string;unit:string;quantity:number;unit_rate:number};
type Milestone={id:string;title:string;completed:boolean;due_date:string|null};
type Activity={id:string;category:string;body:string;created_at:string;actor:string};
type Related={id:string;kind:string;title:string;status:string;amount:number};
type Detail={requirements:Requirement[];lines:Line[];milestones:Milestone[];activities:Activity[];related:Related[]};
export function OperationsWorkbench({id,kind,status,canEdit,onHandover,onChanged}:{id:string;kind:string;status:string;canEdit:boolean;onHandover:(id:string)=>void;onChanged:()=>Promise<void>}){
 const [data,setData]=useState<Detail|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const [name,setName]=useState(""),[note,setNote]=useState(""),[due,setDue]=useState("");
 const [line,setLine]=useState({description:"",unit:"m²",quantity:"1",unitRate:"0"});
 async function load(){
  const r=await fetch("/api/forge/records/"+encodeURIComponent(id)+"/operations",{cache:"no-store"});
  if(!r.ok)throw Error("Could not load operational details");
  setData(await r.json());
 }
 useEffect(()=>{
  let stopped=false;
  fetch("/api/forge/records/"+encodeURIComponent(id)+"/operations",{cache:"no-store"})
   .then(async r=>{if(!r.ok)throw Error("Could not load operational details");return r.json()})
   .then(d=>{if(!stopped)setData(d)}).catch(e=>{if(!stopped)setError(String(e))});
  return ()=>{stopped=true};
 },[id]);
 async function action(key:string,payload:Record<string,unknown>={}){
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/forge/records/"+encodeURIComponent(id)+"/operations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:key,...payload})});
   const d=await r.json();
   if(!r.ok)throw Error(d.error||"Operation failed");
   if(d.projectId)onHandover(d.projectId);
   else{await load();await onChanged()}
   setName("");setNote("");setDue("");setLine({description:"",unit:"m²",quantity:"1",unitRate:"0"});
  }catch(e){setError(e instanceof Error?e.message:"Operation failed")}finally{setBusy(false)}
 }
 const send=(e:FormEvent<HTMLFormElement>,key:string,data:Record<string,unknown>)=>{e.preventDefault();void action(key,data)};
 const total=data?.lines.reduce((v,x)=>v+x.quantity*x.unit_rate,0)||0;
 return <section className="forge-operations">
  <div className="forge-operations-head"><div><span className="forge-workbench-kicker">CONNECTED OPERATIONS</span><h3>{kind==="tenders"?"Bid compliance & handover":kind==="quotes"?"Bill of quantities":kind==="projects"?"Delivery milestones":"Activity history"}</h3></div><span className="forge-workbench-live"><i/> Live database</span></div>
  {error&&<div role="alert" className="forge-auth-error">{error}</div>}
  {!data&&<div className="forge-workbench-loading">Loading operational details…</div>}
  {data&&<>
   {kind==="tenders"&&<>
    <p className="forge-workbench-description">Track bid requirements before submission and hand an awarded tender over to the delivery team.</p>
    <div className="forge-workbench-summary"><span>Completed requirements</span><strong>{data.requirements.filter(r=>r.completed).length} / {data.requirements.length}</strong></div>
    <div className="forge-workbench-items">{data.requirements.map(item=><label key={item.id} className="forge-workbench-check"><input type="checkbox" disabled={!canEdit||busy} checked={item.completed} onChange={()=>void action("toggle_requirement",{itemId:item.id})}/><span className={item.completed?"forge-workbench-done":""}>{item.title}</span></label>)}{data.requirements.length===0&&<p>No compliance items yet.</p>}</div>
    {canEdit&&<form className="forge-workbench-inline" onSubmit={e=>send(e,"add_requirement",{title:name})}><input required maxLength={180} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Signed bid declaration"/><button disabled={busy} type="submit"><Icon name="plus" size={16}/> Add</button></form>}
    {status==="Awarded"&&<button disabled={!canEdit||busy||data.related.some(x=>x.kind==="projects")} className="forge-workbench-handover" onClick={()=>void action("handover")}><Icon name="hardhat" size={17}/>{data.related.some(x=>x.kind==="projects")?"Project already created":"Create delivery project from awarded tender"}<Icon name="arrow-right" size={16}/></button>}
   </>}
   {kind==="quotes"&&<>
    <p className="forge-workbench-description">Price materials, labour and subcontracted work with an itemised estimate. The quotation total updates automatically.</p>
    <div className="forge-boq-scroll"><table className="forge-boq-table"><thead><tr><th>DESCRIPTION</th><th>QTY</th><th>UNIT</th><th>RATE</th><th>AMOUNT</th><th/></tr></thead><tbody>{data.lines.map(item=><tr key={item.id}><td>{item.description}</td><td>{item.quantity}</td><td>{item.unit}</td><td>{money(item.unit_rate)}</td><td>{money(item.quantity*item.unit_rate)}</td><td>{canEdit&&<button disabled={busy} aria-label={"Remove "+item.description} onClick={()=>void action("remove_line",{itemId:item.id})}><Icon name="trash" size={15}/></button>}</td></tr>)}</tbody></table></div>
    <div className="forge-boq-total"><span>QUOTATION SUBTOTAL (EXCL. VAT)</span><strong>{money(total)}</strong></div>
    {canEdit&&<form className="forge-boq-form" onSubmit={e=>send(e,"add_line",{description:line.description,unit:line.unit,quantity:Number(line.quantity),unitRate:Number(line.unitRate)})}><input required maxLength={240} placeholder="Work item description" value={line.description} onChange={e=>setLine({...line,description:e.target.value})}/><div><label>Quantity<input type="number" required min="0.001" step="0.001" value={line.quantity} onChange={e=>setLine({...line,quantity:e.target.value})}/></label><label>Unit<input required maxLength={40} value={line.unit} onChange={e=>setLine({...line,unit:e.target.value})}/></label><label>Unit rate (R)<input type="number" required min="0" step="0.01" value={line.unitRate} onChange={e=>setLine({...line,unitRate:e.target.value})}/></label></div><button type="submit" disabled={busy}><Icon name="plus" size={15}/> Add line item</button></form>}
   </>}
   {kind==="projects"&&<>
    <p className="forge-workbench-description">Organise the delivery programme with completion checkpoints and dated project milestones.</p>
    <div className="forge-workbench-summary"><span>Milestones completed</span><strong>{data.milestones.filter(r=>r.completed).length} / {data.milestones.length}</strong></div>
    <div className="forge-workbench-items">{data.milestones.map(item=><label className="forge-workbench-check" key={item.id}><input type="checkbox" disabled={!canEdit||busy} checked={item.completed} onChange={()=>void action("toggle_milestone",{itemId:item.id})}/><span className={item.completed?"forge-workbench-done":""}>{item.title}</span><small>{item.due_date||"No deadline"}</small></label>)}{!data.milestones.length&&<p>No milestones scheduled yet.</p>}</div>
    {canEdit&&<form className="forge-workbench-inline forge-workbench-milestone" onSubmit={e=>send(e,"add_milestone",{title:name,dueDate:due})}><input required maxLength={180} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Concrete foundation inspection"/><input type="date" value={due} onChange={e=>setDue(e.target.value)}/><button type="submit" disabled={busy}><Icon name="plus" size={16}/> Add</button></form>}
   </>}
   {data.related.length>0&&<div className="forge-workbench-related"><h4>Linked records</h4>{data.related.map(item=><div key={item.id}><Icon name={item.kind==="projects"?"hardhat":"bid"} size={17}/><div><strong>{item.title}</strong><small>{item.id} · {item.status}</small></div><b>{money(item.amount)}</b></div>)}</div>}
   <div className="forge-workbench-activity"><h4>Activity & collaboration</h4>{canEdit&&<form onSubmit={e=>send(e,"add_note",{body:note})}><textarea required maxLength={2000} rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="Record a call, site update, client feedback or internal note…"/><button disabled={busy} type="submit"><Icon name="send" size={15}/> Post update</button></form>}<div className="forge-workbench-timeline">{data.activities.map(item=><div key={item.id}><span className="forge-workbench-timeline-icon"><Icon name={item.category==="handover"?"hardhat":"file"} size={14}/></span><div><strong>{item.actor}</strong><small>{new Date(item.created_at).toLocaleString("en-ZA",{dateStyle:"medium",timeStyle:"short"})}</small><p>{item.body}</p></div></div>)}{!data.activities.length&&<p className="forge-workbench-empty">No activity recorded. Updates will appear here with timestamps and authors.</p>}</div></div>
  </>}
 </section>;
}
