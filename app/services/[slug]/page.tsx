import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { SectionCta } from "@/components/section-cta";
import { services } from "@/data/site";
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return services.map(s=>({slug:s.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params;const s=services.find(x=>x.slug===slug);return {title:s?`${s.title} | STRATA Construction Concept`:"Service | STRATA",description:s?.lead};}
export default async function ServiceDetail({params}:Props){
 const {slug}=await params;const service=services.find(s=>s.slug===slug);if(!service)notFound();
 return <main>
 <PageHero eyebrow={`CAPABILITIES / ${service.n}`} title={service.title} description={service.lead} image={service.image} crumb={service.title}/>
 <section className="section"><div className="wrap service-detail-grid"><div><span className="overline">SCOPE OF WORK</span><h2>What this service can include.</h2><p className="detail-intro">Explore indicative work categories and requirements. Final scope and availability would be established in a real project consultation.</p><ul className="scope-list">{service.scope.map((item,i)=><li key={item}><span>{String(i+1).padStart(2,"0")}</span>{item}</li>)}</ul></div><aside className="detail-aside"><span className="overline">TYPICAL APPLICATIONS</span>{service.applications.map((item,i)=><div className="aside-row" key={item}><span>{String(i+1).padStart(2,"0")}</span><strong>{item}</strong></div>)}<Link href="/contact" className="button primary aside-button">ENQUIRE ABOUT THIS SERVICE <span>↗</span></Link></aside></div></section>
 <section className="section about-values"><div className="wrap"><div className="section-head"><div><span className="overline">FROM BRIEF TO BUILD</span><h2>A considered<br/>way forward.</h2></div><p>Strong outcomes begin with clarity on the requirements, the sequence of work and the people involved.</p></div><div className="three-grid">{service.process.map((item,i)=><div className="value-card" key={item}><span>STEP {String(i+1).padStart(2,"0")}</span><h3>{item}</h3></div>)}</div></div></section>
 <section className="section"><div className="wrap related-heading"><div><span className="overline">EXPLORE MORE</span><h2>Other capabilities.</h2></div><Link href="/services" className="text-link">ALL SERVICES <span>↗</span></Link></div><div className="wrap related-grid">{services.filter(s=>s.slug!==slug).slice(0,3).map(s=><Link className="related-card" key={s.slug} href={`/services/${s.slug}`}><span>{s.n} / SERVICE</span><strong>{s.title}</strong><span aria-hidden="true">↗</span></Link>)}</div></section>
 <SectionCta title="Have a scope to discuss?"/>
 </main>;
}