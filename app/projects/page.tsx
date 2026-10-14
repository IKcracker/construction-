import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { SectionCta } from "@/components/section-cta";
import { ProjectFilter } from "./project-filter";
export const metadata:Metadata={title:"Concept Projects | STRATA Construction",description:"Explore illustrative construction portfolio categories across commercial, residential and civil works."};
export default function ProjectsPage(){return <main>
 <PageHero eyebrow="THE POSSIBILITIES" title="Built to show\nwhat's possible." description="Explore a curated collection of fictional project scenarios that demonstrate how a construction company's work can be presented." image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=85" crumb="Projects"/>
 <section className="section"><div className="wrap"><div className="section-head"><div><span className="overline">CONCEPT PORTFOLIO</span><h2>Explore the different<br/>spaces we build.</h2></div><p>Filter by project type and open each concept for a closer look at its illustrative scope and approach.</p></div><ProjectFilter/></div></section>
 <SectionCta title="What could your next project be?"/>
 </main>;}
