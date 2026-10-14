import {NextRequest} from "next/server";
import {deleteSession,safeSameOrigin} from "@/lib/forge/security";
import {fail,json} from "@/lib/forge/response";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 if(!safeSameOrigin(request))return fail("Origin verification failed",403);
 await deleteSession();
 return json({ok:true});
}
