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
export async function installForgeFixtures(sql,fixtures,organizationId,userId){
 if(!organizationId||!userId)throw new Error("Organization and administrator are required.");
 if(!fixtures||!Array.isArray(fixtures.records)||!Array.isArray(fixtures.lines))throw new Error("Fixture pack is invalid.");
 const summary=forgeFixtureSummary(fixtures);
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
 const today=new Date();
 const base=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate(),12));
 return sql.begin(async tx=>{
  await tx`SELECT pg_advisory_xact_lock(hashtext(${organizationId}),hashtext(${FORGE_SAMPLE_PACK_KEY}))`;
  const existing=await tx`SELECT installed_at,record_count FROM crm_seed_installs WHERE organization_id=${organizationId} AND pack_key=${FORGE_SAMPLE_PACK_KEY}`;
  if(existing.length)return {created:false,summary,installedAt:existing[0].installed_at};
  const actor=await tx`SELECT id FROM crm_users WHERE id=${userId} AND organization_id=${organizationId} AND role='admin' AND disabled=false LIMIT 1`;
  if(!actor.length)throw new Error("Only a current workspace administrator can load sample records.");
  // A deterministic, tenant-scoped ID ensures example rows never collide with other organizations.
  for(const row of fixtures.records){
   const id=keyMap.get(row.key);
   const amount=row.kind==="quotes"?(lineTotals.get(row.key)||0):Number(row.amount);
   const day=dueDate(row.dueDays,base);
   const description="[SAMPLE DATA] "+row.description+". This record is fictional and is intended only for FORGE walkthroughs.";
   const sourceId=row.sourceKey?keyMap.get(row.sourceKey):null;
   await tx`INSERT INTO crm_records
     (id,organization_id,kind,title,client,owner,status,amount,target_date,description,progress,created_by,updated_by,source_tender_id,is_sample)
     VALUES(${id},${organizationId},${row.kind},${row.title},${row.client},${row.owner},${row.status},${amount},${day},${description},${Number(row.progress||0)},${userId},${userId},${sourceId},true)
     ON CONFLICT (id) DO NOTHING`;
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
