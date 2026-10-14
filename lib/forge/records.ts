import {config,type CrmRecord,type ModuleKey} from "@/app/crm-demo/crm-data";
import {db} from "./db";
import type {ForgeUser} from "./security";

export function isModule(v:string):v is ModuleKey {
 return Object.prototype.hasOwnProperty.call(config,v);
}
export function validateInput(data:unknown,kind:ModuleKey):{data:Omit<CrmRecord,"id"|"progress">&{progress:number}}|{error:string}{
 if(!data || typeof data!=="object")return {error:"Invalid request body"};
 const body=data as Record<string,unknown>;
 const title=String(body.title??"").trim().slice(0,160);
 const client=String(body.client??"").trim().slice(0,160);
 const owner=String(body.owner??"").trim().slice(0,120);
 const status=String(body.status??"");
 const date=String(body.date??"");
 const amount=Number(body.amount||0);
 const progress=Number(body.progress||0);
 const description=String(body.description??"").trim().slice(0,10000);
 if(!title||!client||!owner)return {error:"Title, organisation and owner are required"};
 if(!config[kind].statuses.includes(status))return {error:"Invalid workflow stage"};
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date)))return {error:"Use a valid target date"};
 if(!Number.isFinite(amount)||amount<0||amount>999999999999)return {error:"Invalid record value"};
 if(!Number.isInteger(progress)||progress<0||progress>100)return {error:"Progress must be between 0 and 100"};
 return {data:{title,client,owner,status,date,amount,progress,description}};
}
export function mapRecord(row:Record<string,unknown>):CrmRecord{
 return {id:String(row.id),title:String(row.title),client:String(row.client),owner:String(row.owner),
 status:String(row.status),amount:Number(row.amount),date:String(row.date),description:String(row.description||""),progress:Number(row.progress||0)};
}
export async function getRecords(user:ForgeUser){
 const rows=await db()`SELECT id,kind,title,client,owner,status,amount,progress,
 to_char(target_date,'YYYY-MM-DD') AS date,description
 FROM crm_records WHERE organization_id=${user.organizationId} ORDER BY created_at DESC LIMIT 1500`;
 const result:Record<ModuleKey,CrmRecord[]>={tenders:[],quotes:[],projects:[],clients:[],tasks:[],documents:[]};
 for(const row of rows){
  if(isModule(row.kind))result[row.kind].push(mapRecord(row));
 }
 return result;
}
