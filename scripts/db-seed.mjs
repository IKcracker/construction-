#!/usr/bin/env node
import {existsSync,readFileSync} from "node:fs";
import {join,resolve} from "node:path";
import postgres from "postgres";
import {forgeFixtureSummary,installForgeFixtures,validateForgeFixtures,FORGE_SAMPLE_PACK_KEY} from "../lib/forge/seed-core.mjs";

const root=resolve(import.meta.dirname,"..");
const fixtures=JSON.parse(readFileSync(join(root,"db","forge-sample-fixtures.json"),"utf8"));
const args=process.argv.slice(2);
const flag=(key)=>args.includes(key);
const option=(key)=>{const index=args.indexOf(key);return index>=0?args[index+1]||"":args.find(arg=>arg.startsWith(key+"="))?.slice(key.length+1)||""};
function loadEnv(){
 for(const name of [".env.local",".env"]){const path=join(root,name);if(existsSync(path))process.loadEnvFile(path)}
}
async function main(){
 validateForgeFixtures(fixtures);
 const summary=forgeFixtureSummary(fixtures);
 console.log("FORGE fictional sample dataset: "+JSON.stringify(summary.byModule));
 console.log(summary.requirements+" tender requirements, "+summary.lines+" quotation lines, "+summary.milestones+" milestones, "+summary.activities+" activities.");
 if(flag("--help")){
  console.log("npm run db:seed -- --validate");
  console.log("npm run db:seed -- --email admin@company.co.za --dry-run");
  console.log("npm run db:seed -- --email admin@company.co.za --confirm");
  console.log("To seed a workspace containing real records, add --allow-mixed AND --confirm.");
  return;
 }
 if(flag("--validate")){console.log("PASS: fixture data and references validated; database untouched.");return}
 const email=option("--email").trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error("Specify --email for an existing active FORGE administrator.");
 const confirmed=flag("--confirm"),dryRun=flag("--dry-run");
 if(confirmed===dryRun)throw Error("Specify exactly one of --dry-run or --confirm.");
 loadEnv();
 if(!process.env.FORGE_DATABASE_URL)throw Error("FORGE_DATABASE_URL is missing. Add your private database connection to .env.local.");
 const sql=postgres(process.env.FORGE_DATABASE_URL,{ssl:"require",prepare:false,max:1,connect_timeout:10});
 try{
  const admins=await sql`SELECT u.id,u.organization_id,o.name AS company FROM crm_users u JOIN crm_organizations o ON o.id=u.organization_id
   WHERE lower(u.email)=${email} AND u.role='admin' AND u.disabled=false LIMIT 1`;
  if(!admins.length)throw Error("No active administrator found for "+email+". Sign up and create a workspace first.");
  const admin=admins[0],org=admin.organization_id;
  const [installed,counts]=await Promise.all([
   sql`SELECT installed_at FROM crm_seed_installs WHERE organization_id=${org} AND pack_key=${FORGE_SAMPLE_PACK_KEY} LIMIT 1`,
   sql`SELECT count(*) FILTER (WHERE is_sample)::int AS sample_count,count(*) FILTER (WHERE NOT is_sample)::int AS real_count FROM crm_records WHERE organization_id=${org}`
  ]);
  console.log("Selected workspace:",admin.company,"| real records:",counts[0].real_count,"| sample records:",counts[0].sample_count);
  if(installed.length){console.log("Sample pack is already installed here; no changes made.");return}
  if(dryRun){console.log("DRY RUN: no rows inserted. Run with --confirm to proceed.");return}
  if(counts[0].real_count>0&&!flag("--allow-mixed"))throw Error("This workspace contains real records. Seed a separate workspace or explicitly add --allow-mixed to --confirm.");
  const result=await installForgeFixtures(sql,fixtures,org,admin.id,flag("--allow-mixed"));
  console.log(result.created?"SUCCESS: fictional sample data installed.":"Sample pack already present; no changes.",JSON.stringify(result.summary));
 }finally{await sql.end({timeout:5})}
}
main().catch(error=>{console.error("db:seed:",error instanceof Error?error.message:String(error));process.exitCode=1});
