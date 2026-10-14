import "server-only";
export async function sendForgePasswordReset(email:string,resetUrl:string){
 const apiKey=process.env.RESEND_API_KEY;
 const from=process.env.FORGE_RESET_FROM_EMAIL;
 if(!apiKey||!from)throw new Error("Password reset email delivery is not configured");
 const response=await fetch("https://api.resend.com/emails",{
  method:"POST",headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json"},
  body:JSON.stringify({from,to:[email],subject:"Reset your FORGE CRM password",text:"You requested a password reset for FORGE CRM. This link expires in 20 minutes and can be used once:\n\n"+resetUrl+"\n\nIf you did not request this, you can ignore this email. Do not share this link."}),
  cache:"no-store",signal:AbortSignal.timeout(10000)
 });
 if(!response.ok)throw new Error("Password reset email delivery failed");
}
