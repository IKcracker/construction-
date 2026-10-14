import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { SectionCta } from "@/components/section-cta";
import { services } from "@/data/site";
import { ServiceIcon } from "@/components/service-icon";
export const metadata:Metadata={title:"Construction Services | STRATA Concept",description:"Explore building construction, civil works, materials, project management and site preparation service concepts."};
export default function ServicesPage(){
 return <main>
 <PageHero eyebrow="OUR EXPERTISE" title="Made for the work\nthat matters." description="Construction, civil works, materials supply and project delivery—organised around the full journey from groundwork to handover." image="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=85" crumb="Services"/>
 <section className="section"><div className="wrap"><div className="section-head"><div><span className="overline">OUR SOLUTIONS</span><h2>One clear direction.<br/>Multiple capabilities.</h2></div><p>Browse detailed example service pages to explore common scopes, project needs and ways to begin a conversation.</p></div><div className="service-grid">{services.map(s=><article className="service-card" key={s.slug}><div className="card-n">{s.n} / CAPABILITIES <span>↗</span></div><ServiceIcon slug={s.slug}/><h3>{s.title}</h3><p>{s.desc}</p><Link href={`/services/${s.slug}`}>EXPLORE SERVICE <span>↗</span></Link></article>)}</div></div></section>
 <section className="section process"><div className="wrap"><div className="section-head"><div><span className="overline">WHY IT WORKS</span><h2>Connected services.<br/>A coordinated approach.</h2></div><p>Site activities, materials and delivery timelines are closely linked. A clear approach helps projects move forward.</p></div><div className="steps">{[["01","Understand","Clarify scope and requirements."],["02","Prepare","Map tasks, resources and interfaces."],["03","Coordinate","Align execution with the plan."],["04","Review","Check results and prepare handover."]].map(([n,h,d])=><div className="step" key={n}><strong>{n}</strong><h3>{h}</h3><p>{d}</p></div>)}</div></div></section>
 <SectionCta title="Planning a construction project?"/>
 </main>;
}