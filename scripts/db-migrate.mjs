#!/usr/bin/env node
/**
 * FORGE database migrator:
 * - loads .env.local / .env when running from the repository;
 * - applies numbered SQL migrations in lexical order;
 * - wraps each migration in a PostgreSQL transaction and advisory lock;
 * - records checksums to guard against modifying applied migrations;
 * - supports --validate to check files without a database connection.
 */
import {createHash} from "node:crypto";
import {existsSync,readFileSync,readdirSync} from "node:fs";
import {join,resolve} from "node:path";
import postgres from "postgres";

const root=resolve(import.meta.dirname,"..");
const dir=join(root,"db","migrations");
const normalize=(value)=>value.replace(/\r\n?/g,"\n").trimEnd()+"\n";
const checksum=(value)=>createHash("sha256").update(value).digest("hex");
const validateOnly=process.argv.includes("--validate");

function readMigrations(){
 if(!existsSync(dir))throw new Error("No migrations directory. Run npm run db:generate first.");
 const files=readdirSync(dir).filter(name=>name.endsWith(".sql")).sort();
 if(!files.length)throw new Error("No migration files. Run npm run db:generate first.");
 return files.map((filename)=>{
   if(!/^\d{4}_[a-z0-9_]+\.sql$/.test(filename))throw new Error("Invalid migration filename: "+filename);
   const content=normalize(readFileSync(join(dir,filename),"utf8"));
   // Reject comment-only scaffolds, so no-op migrations are never marked complete.
   const statements=content.replace(/^\s*--.*$/gm,"").trim();
   if(!statements||!statements.includes(";"))throw new Error("Migration has no SQL statements: "+filename);
   return {filename,content,checksum:checksum(content)};
 });
}
function loadEnvironment(){
 // Keep secrets outside git. Explicitly load local settings for standalone Node CLI.
 for(const file of [".env.local",".env"]){
   const full=join(root,file);
   if(existsSync(full))process.loadEnvFile(full);
 }
}
async function main(){
 const migrations=readMigrations();
 if(validateOnly){
   console.log("Validated "+migrations.length+" FORGE SQL migration(s).");
   migrations.forEach(({filename})=>console.log("  "+filename));
   return;
 }
 loadEnvironment();
 const url=process.env.FORGE_DATABASE_URL;
 if(!url)throw new Error("FORGE_DATABASE_URL not configured. Add it to .env.local (from your dedicated Neon forgecrm database).");
 const database=postgres(url,{ssl:"require",max:1,prepare:false,connect_timeout:10,idle_timeout:5});
 try{
   // Migration history is purposefully separate from business tables.
   await database`CREATE TABLE IF NOT EXISTS crm_schema_migrations (
     filename text PRIMARY KEY,
     checksum char(64) NOT NULL,
     applied_at timestamptz NOT NULL DEFAULT now()
   )`;
   let applied=0;
   for(const migration of migrations){
     const status=await database.begin(async(tx)=>{
       // Serializes concurrent migration CLIs against the same database.
       await tx`SELECT pg_advisory_xact_lock(8042910021::bigint)`;
       const previous=await tx`SELECT checksum FROM crm_schema_migrations WHERE filename=${migration.filename}`;
       if(previous.length){
         if(previous[0].checksum!==migration.checksum){
           throw new Error("Previously applied migration was modified: "+migration.filename);
         }
         return "skipped";
       }
       // The simple protocol supports multi-statement SQL in a single transaction.
       await tx.unsafe(migration.content).simple();
       await tx`INSERT INTO crm_schema_migrations (filename,checksum)
         VALUES (${migration.filename},${migration.checksum})`;
       return "applied";
     });
     console.log((status==="applied"?"Applied ":"Already applied ")+migration.filename);
     if(status==="applied")applied++;
   }
   console.log("FORGE migration complete: "+applied+" applied, "+(migrations.length-applied)+" already current.");
 }finally{
   await database.end({timeout:5});
 }
}
main().catch(error=>{
 console.error("db:migrate:",error instanceof Error?error.message:String(error));
 process.exitCode=1;
});
