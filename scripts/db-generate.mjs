#!/usr/bin/env node
/**
 * FORGE SQL migration generator.
 *
 * With no argument, verifies or creates the initial migration from
 * db/forge-schema.sql. For later structural changes, scaffold a
 * forward-only SQL migration with: npm run db:generate -- add_new_field
 *
 * Explicit incremental SQL is safer than replaying CREATE TABLE IF NOT EXISTS
 * statements, which cannot add columns to existing tables.
 */
import {existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from "node:fs";
import {join,resolve} from "node:path";

const root=resolve(import.meta.dirname,"..");
const source=join(root,"db","forge-schema.sql");
const migrationsDir=join(root,"db","migrations");
const baselineName="0001_initial_schema.sql";
const baseline=join(migrationsDir,baselineName);
const args=process.argv.slice(2);
const normalize=(value)=>value.replace(/\r\n?/g,"\n").trimEnd()+"\n";

function main(){
 if(!existsSync(source))throw new Error("Source schema missing: db/forge-schema.sql");
 mkdirSync(migrationsDir,{recursive:true});
 const definition=normalize(readFileSync(source,"utf8"));
 if(!definition.includes("CREATE TABLE IF NOT EXISTS crm_organizations")||
    !definition.includes("CREATE TABLE IF NOT EXISTS crm_records")){
   throw new Error("The canonical schema appears incomplete; refusing migration generation.");
 }
 const known=readdirSync(migrationsDir).filter(name=>/^\d{4}_[a-z0-9_]+\.sql$/.test(name)).sort();
 const requested=args.find(arg=>!arg.startsWith("-"));
 const check=args.includes("--check");

 if(!existsSync(baseline)){
   if(known.length)throw new Error("Initial migration is missing but incremental migrations already exist.");
   if(check)throw new Error("Initial SQL migration has not been generated.");
   writeFileSync(baseline,definition,{flag:"wx"});
   console.log("Generated db/migrations/"+baselineName+" from db/forge-schema.sql");
   return;
 }
 if(normalize(readFileSync(baseline,"utf8"))!==definition){
   console.warn("Note: db/forge-schema.sql differs from the historical initial migration.");
   console.warn("Do not rewrite an applied migration; add a forward-only ALTER/CREATE migration instead.");
   if(!requested)throw new Error("Generate an incremental migration with npm run db:generate -- describe_change");
 }
 if(!requested){
   console.log("Initial migration exists and is unchanged. No new migration needed.");
   console.log("For a schema change, run: npm run db:generate -- add_field_name");
   return;
 }
 if(check)throw new Error("Do not specify a migration name with --check.");
 const name=requested.trim().toLowerCase().replace(/[\s-]+/g,"_");
 if(!/^[a-z][a-z0-9_]{1,60}$/.test(name))throw new Error("Migration name must be 2-61 letters, digits, or underscores, starting with a letter.");
 const last=known.length?Number(known.at(-1).slice(0,4)):1;
 if(!Number.isSafeInteger(last)||last>=9999)throw new Error("Migration number limit reached.");
 const file=String(last+1).padStart(4,"0")+"_"+name+".sql";
 const body=[
   "-- FORGE CRM forward-only migration: "+name,
   "-- Replace these comments with the SQL changes you intend to make.",
   "-- Example: ALTER TABLE crm_records ADD COLUMN IF NOT EXISTS external_ref text;",
   "-- A comment-only migration is rejected by db:migrate.",
   ""
 ].join("\n");
 writeFileSync(join(migrationsDir,file),body,{flag:"wx"});
 console.log("Created db/migrations/"+file);
 console.log("Edit that file with your ALTER TABLE / CREATE INDEX statements, then run npm run db:migrate.");
}
try{main()}catch(error){console.error("db:generate:",error instanceof Error?error.message:error);process.exitCode=1}
