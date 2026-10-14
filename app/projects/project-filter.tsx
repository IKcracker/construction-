"use client";
import Link from "next/link";
import { useState } from "react";
import { projects } from "@/data/site";

const filters=["All Projects","Civil Works","Commercial","Residential"];
export function ProjectFilter(){
 const [active,setActive]=useState("All Projects");
 const visible=projects.filter(p=>active==="All Projects"||p.type===active);
 return <>
  <div className="filters" role="group" aria-label="Filter example projects">
   {filters.map(f=><button key={f} type="button" className={active===f?"active":""} aria-pressed={active===f} onClick={()=>setActive(f)}>{f}</button>)}
  </div>
  <p className="filter-count" aria-live="polite">SHOWING {visible.length} CONCEPT {visible.length===1?"PROJECT":"PROJECTS"}</p>
  <div className="project-grid">{visible.map(p=><Link key={p.slug} href={`/projects/${p.slug}`} className="project" style={{backgroundImage:`linear-gradient(0deg,rgba(10,20,24,.88),rgba(10,20,24,.06) 75%),url("${p.image}")`}} aria-label={`View ${p.title} concept project`}><div className="project-details"><div><span>CONCEPT PROJECT / {p.type.toUpperCase()}</span><h3>{p.title}</h3></div><span className="project-arrow" aria-hidden="true">↗</span></div></Link>)}</div>
  <p className="disclaimer">Concept examples only. Photographs are illustrative and are not evidence of completed works, project clients or certifications.</p>
 </>;
}
