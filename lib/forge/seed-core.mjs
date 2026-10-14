import {createHash} from "node:crypto";

export const FORGE_SAMPLE_PACK_KEY="forge-construction-2026-v1";
const modulePrefixes={tenders:"TND",quotes:"Q",projects:"PRJ",clients:"CON",tasks:"TSK",documents:"DOC"};
function refFor(organizationId,key,kind){
 const hex=createHash("sha256").update(organizationId+":"+FORGE_SAMPLE_PACK_KEY+":"+key).digest("hex").slice(0,16).toUpperCase();
 return modulePrefixes[kind]+"-"+hex;
}
function dueDate(offset,base){
 const d=new Date(base);
 d.setUTCDate(d.getUTCDate()+Number(offset));
 return d.toISOString().slice(0,10);
}
export function forgeFixtureSummary(fixtures){
 return {
  records:fixtures.records.length,requirements:fixtures.requirements.length,
  lines:fixtures.lines.length,milestones:fixtures.milestones.length,activities:fixtures.activities.length,
  byModule:Object.fromEntries(Object.keys(modulePrefixes).map(k=>[k,fixtures.records.filter(r=>r.kind===k).length]))
 };
}
export function validateForgeFixtures(fixtures){
 const modules=Object.keys(modulePrefixes);
 const statuses={tenders:["New","Qualification","In Preparation","Submitted","Awarded","Declined"],quotes:["Draft","Under Review","Sent","Approved","Rejected"],projects:["Planning","Active","At Risk","On Hold","Completed"],clients:["Prospect","Active","Partner","Dormant"],tasks:["To Do","In Progress","Blocked","Done"],documents:["Requested","In Review","Approved","Expired"]};
 if(!fixtures||!Array.isArray(fixtures.records)||fixtures.records.length===0)throw Error("Missing fixture records");
 for(const category of ["requirements","lines","milestones","activities"])if(!Array.isArray(fixtures[category]))throw Error("Missing "+category);
 const keys=new Map();
 for(const row of fixtures.records){
  if(!row||typeof row.key!=="string"||keys.has(row.key))throw Error("Missing or duplicate fixture key");
  if(!modules.includes(row.kind)||!statuses[row.kind].includes(row.status))throw Error("Invalid fixture module/status for "+row.key);
  if(!row.title||row.title.length>160||!row.client||row.client.length>160||!row.owner||row.owner.length>120||typeof row.description!=="string"||row.description.length>9900)throw Error("Invalid fixture text for "+row.key);
  if(!Number.isInteger(row.dueDays)||Math.abs(row.dueDays)>3650||!Number.isFinite(row.amount)||row.amount<0||row.amount>999999999999||!Number.isInteger(row.progress)||row.progress<0||row.progress>100)throw Error("Invalid fixture numbers for "+row.key);
  keys.set(row.key,row.kind);
 }
 for(const row of fixtures.records)if(row.sourceKey&&(row.kind!=="projects"||keys.get(row.sourceKey)!=="tenders"))throw Error("Invalid source tender on "+row.key);
 for(const [key,title,completed] of fixtures.requirements)if(keys.get(key)!=="tenders"||!title||title.length>180||typeof completed!=="boolean")throw Error("Invalid requirement for "+key);
 for(const [key,description,unit,qty,rate] of fixtures.lines)if(keys.get(key)!=="quotes"||!description||description.length>240||!unit||unit.length>40||!Number.isFinite(qty)||qty<=0||qty>100000000||!Number.isFinite(rate)||rate<0||rate>1000000000)throw Error("Invalid quote line for "+key);
 for(const [key,title,offset,completed] of fixtures.milestones)if(keys.get(key)!=="projects"||!title||title.length>180||!Number.isInteger(offset)||Math.abs(offset)>3650||typeof completed!=="boolean")throw Error("Invalid milestone for "+key);
 for(const [key,category,body] of fixtures.activities)if(!keys.has(key)||!["note","status","system","handover","quote"].includes(category)||!body||body.length>1900)throw Error("Invalid activity for "+key);
 return forgeFixtureSummary(fixtures);
}
export async function installForgeFixtures(sql,fixtures,organizationId,userId,allowMixed=false){
 if(!organizationId||!userId)throw new Error("Organization and administrator are required.");
 const summary=validateForgeFixtures(fixtures);
 const keyMap=new Map();
 for(const row of fixtures.records){
  if(!Object.hasOwn(modulePrefixes,row.kind)||keyMap.has(row.key))throw new Error("Invalid fixture record or duplicate key");
  keyMap.set(row.key,refFor(organizationId,row.key,row.kind));
 }
 for(const [key] of [...fixtures.requirements,...fixtures.lines,...fixtures.milestones,...fixtures.activities]){
  if(!keyMap.has(key))throw new Error("Fixture reference is missing: "+key);
 }
 for(const row of fixtures.records){
  if(row.sourceKey&&!keyMap.has(row.sourceKey))throw new Error("Related tender is missing: "+row.sourceKey);
 }
 const lineTotals=new Map();
 for(const [key,, ,qty,rate] of fixtures.lines){
  lineTotals.set(key,(lineTotals.get(key)||0)+Number(qty)*Number(rate));
 }
 const milestoneCount=new Map();
 for(const [key,,,completed] of fixtures.milestones){
  const val=milestoneCount.get(key)||{total:0,done:0};val.total++;if(completed)val.done++;milestoneCount.set(key,val);
 }
 const today=new Date();
 const base=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate(),12));
 return sql.begin(async tx=>{
  await tx`SELECT pg_advisory_xact_lock(hashtext(${organizationId}),hashtext(${FORGE_SAMPLE_PACK_KEY}))`;
  const existing=await tx`SELECT installed_at,record_count FROM crm_seed_installs WHERE organization_id=${organizationId} AND pack_key=${FORGE_SAMPLE_PACK_KEY}`;
  if(existing.length)return {created:false,summary,installedAt:existing[0].installed_at};
  const actor=await tx`SELECT id FROM crm_users WHERE id=${userId} AND organization_id=${organizationId} AND role='admin' AND disabled=false LIMIT 1`;
  if(!actor.length)throw new Error("Only a current workspace administrator can load sample records.");
  const counts=await tx`SELECT count(*) FILTER(WHERE NOT is_sample)::int AS real_count,count(*) FILTER(WHERE is_sample)::int AS sample_count FROM crm_records WHERE organization_id=${organizationId}`;
  if(counts[0].sample_count>0)throw new Error("This workspace already contains sample records without a matching installation record. Ask an administrator to review it.");
  if(counts[0].real_count>0&&!allowMixed)throw new Error("Existing business data detected. Use an empty workspace to keep fictional examples separate.");
  // A deterministic, tenant-scoped ID ensures example rows never collide with other organizations.
  for(const row of fixtures.records){
   const id=keyMap.get(row.key);
   const amount=row.kind==="quotes"?(lineTotals.get(row.key)||0):Number(row.amount);
   const day=dueDate(row.dueDays,base);
   const description="[SAMPLE DATA] "+row.description+". This record is fictional and is intended only for FORGE walkthroughs.";
   const sourceId=row.sourceKey?keyMap.get(row.sourceKey):null;
   const related=milestoneCount.get(row.key);
   const progress=row.kind==="projects"&&related?Math.round(100*related.done/related.total):Number(row.progress||0);
   await tx`INSERT INTO crm_records
     (id,organization_id,kind,title,client,owner,status,amount,target_date,description,progress,created_by,updated_by,source_tender_id,is_sample)
     VALUES(${id},${organizationId},${row.kind},${row.title},${row.client},${row.owner},${row.status},${amount},${day},${description},${progress},${userId},${userId},${sourceId},true)`;
  }
  for(const [key,title,completed] of fixtures.requirements){
   await tx`INSERT INTO crm_tender_requirements (organization_id,tender_id,title,completed,completed_at)
      VALUES(${organizationId},${keyMap.get(key)},${title},${completed},${completed?new Date():null})`;
  }
  for(const [key,description,unit,quantity,unitRate] of fixtures.lines){
   await tx`INSERT INTO crm_quote_line_items(organization_id,quote_id,description,unit,quantity,unit_rate)
     VALUES(${organizationId},${keyMap.get(key)},${description},${unit},${quantity},${unitRate})`;
  }
  for(const [key,title,offset,completed] of fixtures.milestones){
   await tx`INSERT INTO crm_project_milestones(organization_id,project_id,title,due_date,completed,completed_at)
     VALUES(${organizationId},${keyMap.get(key)},${title},${dueDate(offset,base)},${completed},${completed?new Date():null})`;
  }
  for(const [key,category,body] of fixtures.activities){
   await tx`INSERT INTO crm_record_activities(organization_id,record_id,actor_id,category,body)
     VALUES(${organizationId},${keyMap.get(key)},${userId},${category},${"[SAMPLE DATA] "+body})`;
  }
  await tx`INSERT INTO crm_seed_installs(organization_id,pack_key,installed_by,record_count)
   VALUES(${organizationId},${FORGE_SAMPLE_PACK_KEY},${userId},${summary.records})`;
  await tx`INSERT INTO crm_audit_events(organization_id,actor_id,event_type,metadata)
   VALUES(${organizationId},${userId},'sample.loaded',${JSON.stringify({pack:FORGE_SAMPLE_PACK_KEY,records:summary.records})}::jsonb)`;
  return {created:true,summary,installedAt:new Date()};
 });
}
