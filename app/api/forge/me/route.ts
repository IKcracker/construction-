import {NextRequest} from "next/server";
import {authorize,json} from "@/lib/forge/response";
export async function GET(request:NextRequest){
 const auth=await authorize(request);
 if("response" in auth)return auth.response;
 return json({user:auth.user});
}
