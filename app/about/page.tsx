import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { SectionCta } from "@/components/section-cta";
export const metadata:Metadata={title:"About | STRATA Construction Concept",description:"Explore the values, approach and philosophy behind a fictional construction and civil works company."};
export default function AboutPage(){
 return <main>
 <PageHero eyebrow="ABOUT OUR CONCEPT" title="Built with purpose.\nDefined by detail." description="A construction-first mindset that puts careful planning, honest collaboration and quality execution at the centre of every project." crumb="About" image="https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1800&q=85"/>
 <section className="section"><div className="wrap split-story"><div><span className="overline">OUR THINKING</span><h2>Every great build starts with a better question.</h2></div><div className="story-text"><p>What does this project need to achieve? What must happen before work starts? How can we communicate clearly and anticipate what comes next?</p><p>These are the questions that shape STRATA as a fictional brand concept: practical thinking, considered design and a process built around the real demands of construction.</p><p>This site demonstrates the presentation and enquiry experience a construction company could offer—not a claim of operational history, completed contracts or accreditation.</p><Link href="/process" className="text-link">EXPLORE OUR APPROACH <span>↗</span></Link></div></div></section>
 <section className="section about-values"><div className="wrap"><div className="section-head"><div><span className="overline">WHAT GUIDES THE WORK</span><h2>Strong principles.<br/>Lasting value.</h2></div><p>Excellent construction is measured in the details people notice—and the ones they never have to worry about.</p></div><div className="values-grid">{[
 ["01","Clarity first","Clear scope, straight conversations and shared expectations before a project moves forward."],
 ["02","Purposeful quality","Designing the delivery process around fit-for-purpose materials, workmanship and inspection."],
 ["03","Safety in planning","Considering site access, sequencing and responsible coordination early—not as an afterthought."],
 ["04","Accountable delivery","Keeping progress, decisions and handover requirements visible from start to finish."]
 ].map(([n,h,d])=><article className="value-card" key={n}><span>{n} / PRINCIPLE</span><h3>{h}</h3><p>{d}</p></article>)}</div></div></section>
 <section className="section"><div className="wrap feature-band"><div className="feature-band-image" role="img" aria-label="Modern building architecture"/><div className="feature-band-copy"><span className="overline">MORE THAN A BUILD</span><h2>From idea to the built environment.</h2><p>A construction partner&apos;s role goes beyond assembling materials. It involves planning, sequencing, coordination, site awareness and a consistent commitment to the intended result.</p><ul className="check-list"><li>Construction and civil works</li><li>Project management and coordination</li><li>Materials requirements and supply planning</li><li>Site preparation and upgrade works</li></ul><Link href="/services" className="button dark">EXPLORE CAPABILITIES <span>↗</span></Link></div></div></section>
 <SectionCta title="Ready to explore the possibilities?"/>
 </main>;
}