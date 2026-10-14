import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { SectionCta } from "@/components/section-cta";
import { workflow } from "@/data/site";
export const metadata:Metadata={title:"Our Approach | STRATA Concept",description:"A simple four-stage framework for construction planning, execution and handover."};
export default function ProcessPage(){return <main>
 <PageHero eyebrow="OUR APPROACH" title="The process behind\nbetter outcomes." description="Good delivery starts with shared understanding. Explore a practical construction workflow built around four clear stages." image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=85" crumb="Our Process"/>
 <section className="section"><div className="wrap"><div className="section-head"><div><span className="overline">HOW PROJECTS PROGRESS</span><h2>Four stages.<br/>One direction.</h2></div><p>Every brief is different. A consistent framework helps define decisions and responsibilities without losing flexibility.</p></div><div className="process-timeline">{workflow.map(w=><article className="timeline-row" key={w.n}><div className="timeline-number">{w.n}</div><div><span className="overline">STAGE {w.n}</span><h3>{w.name}</h3><p>{w.summary}</p></div><div><p>{w.detail}</p></div></article>)}</div></div></section>
 <section className="section process"><div className="wrap split-story"><div><span className="overline">WORKING TOGETHER</span><h2>Communication is part of the build.</h2></div><div className="story-text"><p>Construction works best when expectations remain visible. Project updates, agreed milestones and clear responsibilities create a stronger foundation for decisions.</p><p>For the live business website, this page could later connect to an enquiry-to-project workflow, customer updates or a project portal.</p><Link href="/contact" className="button primary">DISCUSS YOUR PROJECT <span>↗</span></Link></div></div></section>
 <SectionCta title="Let's map out your next project."/>
 </main>;}
