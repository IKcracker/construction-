import {NextResponse} from "next/server";
import {getForgeUser,permitted,safeSameOrigin,secureResponseHeaders,type ForgeUser} from "./security";
export function json(data:unknown,status=200){
 return NextResponse.json(data,{status,headers:secureResponseHeaders()});
}
export function fail(message:string,status:number){return json({error:message},status);}
export async function authorize(request:Request,action:"read"|"write"|"admin"="read"):Promise<{user:ForgeUser}|{response:NextResponse}>{
 if(action!=="read"&&!safeSameOrigin(request))return {response:fail("Origin verification failed",403)};
 const user=await getForgeUser();
 if(!user)return {response:fail("Sign in to continue",401)};
 if(!permitted(user,action))return {response:fail("Insufficient permissions",403)};
 return {user};
}
export function message(error:unknown){return error instanceof Error?error.message:"Unexpected error";}
