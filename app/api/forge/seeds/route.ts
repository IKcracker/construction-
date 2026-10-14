import {NextRequest} from "next/server";
import {db} from "@/lib/forge/db";
import {authorize,fail,json} from "@/lib/forge/response";
import {safeSameOrigin} from "@/lib/forge/security";
import {FORGE_SAMPLE_PACK_KEY,forgeFixtureSummary,installForgeFixtures} from "@/lib/forge/seed-core.mjs";
import fixtures from "@/db/forge-sample-fixtures.json";

export async function GET(request:NextRequest){
 const auth=await authorize(request,"admin");if("response" in auth)return auth.response;
 try{
  const sql=db(),org=auth.user.organizationId;
  const [registered,counts]=await Promise.all([
   sql`SELECT installed_at,record_count FROM crm_seed_installs WHERE organization_id=${org} AND pack_key=${FORGE_SAMPLE_PACK_KEY} LIMIT 1`,
   sql`SELECT count(*) FILTER (WHERE is_sample)::int AS sample_count,count(*) FILTER (WHERE NOT is_sample)::int AS real_count FROM crm_records WHERE organization_id=${org}`
  ]);
  return json({installed:registered.length>0,installedAt:registered[0]?.installed_at||null,summary:forgeFixtureSummary(fixtures),existing:{sample:counts[0].sample_count,real:counts[0].real_count}});
 }catch(error){console.error("FORGE seed preview",error);return fail("Unable to inspect sample workspace",500)}
}
export async function POST(request:NextRequest){
 const auth=await authorize(request,"admin");if("response" in auth)return auth.response;
 if(!safeSameOrigin(request))return fail("Origin verification failed",403);
 try{
  const body=await request.json() as Record<string,unknown>;
  if(body.confirm!=="LOAD SAMPLE DATA")return fail("Explicit confirmation required",400);
  const result=await installForgeFixtures(db(),fixtures,auth.user.organizationId,auth.user.id);
  return json(result,result.created?201:200);
 }catch(error){console.error("FORGE sample installation",error);return fail("Unable to load sample data. Ensure database migrations have been applied.",500)}
}
