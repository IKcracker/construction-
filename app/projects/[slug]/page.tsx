import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { SectionCta } from "@/components/section-cta";
import { projects } from "@/data/site";
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return projects.map(p=>({slug:p.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params;const p=projects.find(x=>x.slug===slug);return {title:p?`${p.title} | Concept Project`:"Project | STRATA",description:p?.summary};}
export default async function ProjectDetailPage({params}:Props){
 const {slug}=await params;const p=projects.find(x=>x.slug===slug);if(!p)notFound();
 const related=projects.filter(x=>x.slug!==p.slug).slice(0,2);
 return <main>
  <PageHero eyebrow={`CONCEPT PROJECT / ${p.type.toUpperCase()}`} title={p.title} description={p.summary} image={p.image} crumb={p.title}/>
  <section className="section"><div className="wrap"><div className="concept-alert"><strong>ILLUSTRATIVE PROJECT STUDY</strong><p>This project page presents a fictional example, not an actual commission, completed project or client reference. Imagery is for demonstration purposes.</p></div><div className="split-story project-story"><div><span className="overline">THE OPPORTUNITY</span><h2>From concept to construction.</h2></div><div className="story-text"><h3>The challenge</h3><p>{p.challenge}</p><h3>The possible approach</h3><p>{p.solution}</p><Link href="/contact" className="text-link">DISCUSS A SIMILAR PROJECT <span>↗</span></Link></div></div></div></section>
  <section className="section about-values"><div className="wrap service-detail-grid"><div><span className="overline">INDICATIVE SCOPE</span><h2>What this type of work may involve.</h2><ul className="scope-list">{p.scope.map((s,i)=><li key={s}><span>{String(i+1).padStart(2,"0")}</span>{s}</li>)}</ul></div><aside className="detail-aside"><span className="overline">KEY CONSIDERATIONS</span>{p.considerations.map((s,i)=><div className="aside-row" key={s}><span>{String(i+1).padStart(2,"0")}</span><strong>{s}</strong></div>)}</aside></div></section>
  <section className="section"><div className="wrap related-heading"><div><span className="overline">KEEP EXPLORING</span><h2>Other project concepts.</h2></div><Link className="text-link" href="/projects">VIEW ALL PROJECTS <span>↗</span></Link></div><div className="wrap project-grid">{related.map(item=><Link key={item.slug} href={`/projects/${item.slug}`} className="project" style={{backgroundImage:`linear-gradient(0deg,rgba(10,20,24,.88),rgba(10,20,24,.06) 75%),url("${item.image}")`}}><div className="project-details"><div><span>CONCEPT / {item.type.toUpperCase()}</span><h3>{item.title}</h3></div><span className="project-arrow">↗</span></div></Link>)}</div></section>
  <SectionCta title="Have a project of your own?"/>
 </main>;
}
