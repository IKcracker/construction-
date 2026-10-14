import "server-only";
import postgres from "postgres";

type Database = ReturnType<typeof postgres>;
let connection:Database|undefined;

export function isForgeConfigured(){
 return Boolean(process.env.FORGE_DATABASE_URL || process.env.DATABASE_URL);
}
export function db():Database {
 const url=process.env.FORGE_DATABASE_URL || process.env.DATABASE_URL;
 if(!url)throw new Error("FORGE_DATABASE_URL is not configured");
 if(!connection)connection=postgres(url,{ssl:"require",max:5,prepare:false,idle_timeout:20,connect_timeout:10});
 return connection;
}
