"use client";
import { useState, type FormEvent } from "react";
import { services } from "@/data/site";

export function QuoteForm(){
 const [draftReady,setDraftReady]=useState(false);
 function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  const data=new FormData(e.currentTarget);
  const keys:[string,string][]=[["name","Full name"],["email","Email"],["phone","Phone"],["service","Service"],["location","Location"],["timeline","Expected timeline"],["message","Project details"]];
  const lines=keys.map(([key,label])=>label+": "+String(data.get(key)||"Not provided")).join("\n");
  const subject=encodeURIComponent("STRATA concept website — sample project enquiry");
  const body=encodeURIComponent("UNSENT DEMONSTRATION ENQUIRY — NO RECIPIENT SET\n\n"+lines+"\n\nThis is a sample email created on a fictional concept website. Review before sending.");
  setDraftReady(true);
  window.location.href="mailto:?subject="+subject+"&body="+body;
 }
 return <form className="contact-form" onSubmit={submit}>
 <div className="form-intro"><span className="overline">PROJECT ENQUIRY</span><h3>Tell us about your project.</h3><p>Use the fields below to preview how an enquiry could be captured on a construction company&apos;s website.</p></div>
 <div className="form-two">
 <label>Full name *<input name="name" autoComplete="name" required maxLength={100} placeholder="Your full name"/></label>
 <label>Email address *<input name="email" type="email" autoComplete="email" required maxLength={150} placeholder="you@example.com"/></label>
 <label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="Your contact number"/></label>
 <label>Service required *<select name="service" required defaultValue=""><option value="" disabled>Select a service</option>{services.map(s=><option key={s.slug}>{s.title}</option>)}</select></label>
 <label>Project location<input name="location" autoComplete="address-level2" maxLength={150} placeholder="Town or region"/></label>
 <label>Expected timeline<select name="timeline" defaultValue=""><option value="">Not sure yet</option><option>As soon as practical</option><option>Within 1–3 months</option><option>Within 3–6 months</option><option>6+ months</option></select></label>
 </div>
 <label>Project details *<textarea name="message" required minLength={10} maxLength={2000} rows={6} placeholder="Tell us about the project type, approximate scope, site and what you are looking to achieve..."/></label>
 <button className="button primary" type="submit">PREVIEW ENQUIRY EMAIL <span aria-hidden="true">↗</span></button>
 <p className="form-note" role="status">{draftReady?"An unsent draft may open in your email app. No message was submitted to a company.":"Demonstration form: your email app opens an unsent draft with no recipient. There is no backend, storage or automatic submission."}</p>
 </form>;
}
