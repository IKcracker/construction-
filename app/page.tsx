import Link from "next/link";
import { services, projects, workflow } from "@/data/site";
import { ServiceIcon } from "@/components/service-icon";
import { SectionCta } from "@/components/section-cta";

export default function Home(){
 return <main>
  <section className="hero" aria-labelledby="hero-title">
   <div className="hero-photo" role="img" aria-label="Building construction underway, representing civil and structural work"/>
   <div className="wrap hero-layout">
    <div className="hero-content">
     <span className="overline">ENGINEERED FOR WHAT&apos;S NEXT</span>
     <h1 id="hero-title">We build the<br/><em>foundations</em><br/>of tomorrow<span className="hero-period">.</span></h1>
     <p>Purposeful construction, dependable civil works and coordinated project delivery. A more considered way to bring big plans to life.</p>
     <div className="hero-actions"><Link href="/services" className="button primary">DISCOVER OUR SERVICES <span aria-hidden="true">↗</span></Link><Link href="/projects" className="button ghost">EXPLORE PROJECTS <span aria-hidden="true">↗</span></Link></div>
    </div>
    <div className="hero-sidebar"><div className="hero-vertical">THE BUILT ENVIRONMENT / SOUTH AFRICA</div><div className="hero-sidebar-bottom"><span>01 — 04</span><span>CRAFTING THE NEXT CHAPTER<br/>OF THE BUILT WORLD</span></div></div>
   </div>
   <div className="hero-foot"><div className="wrap"><span>CONSTRUCTION <i/> CIVIL ENGINEERING <i/> MATERIALS</span><Link href="/about">MEET STRATA <span aria-hidden="true">↗</span></Link></div></div>
  </section>
  <div className="strap"><div className="wrap strap-inner"><span>BUILDING CONSTRUCTION</span><b>✳</b><span>CIVIL INFRASTRUCTURE</span><b>✳</b><span>PROJECT DELIVERY</span><b>✳</b><span>MATERIALS SUPPLY</span></div></div>
  <section className="intro-section section"><div className="wrap intro-grid"><div><span className="overline">CONSTRUCTION WITH INTENTION</span><h2>A better way<br/>to <span className="orange-text">build forward.</span></h2></div><div className="intro-side"><p>Great outcomes start with great groundwork. From the first conversation to the final detail, successful construction is built on planning, collaboration and a commitment to doing things properly.</p><Link href="/about" className="text-link">LEARN ABOUT OUR APPROACH <span aria-hidden="true">↗</span></Link></div></div><div className="wrap intro-values"><span>01 / PRACTICAL EXPERTISE</span><span>02 / CLEAR COORDINATION</span><span>03 / PURPOSEFUL DELIVERY</span></div></section>
  <section id="services" className="section services-section"><div className="wrap"><div className="section-head"><div><span className="overline">WHAT WE DO</span><h2>Our expertise.<br/>Your next move.</h2></div><div className="section-action"><p>From large-scale groundwork to precision-built spaces, explore the capabilities that bring projects together.</p><Link className="text-link" href="/services">ALL SERVICES <span aria-hidden="true">↗</span></Link></div></div>
   <div className="service-grid">{services.map(s=><article className="service-card" key={s.slug}><div className="card-n">{s.n} <span>STRATA / CAPABILITIES</span></div><ServiceIcon slug={s.slug}/><h3>{s.title}</h3><p>{s.desc}</p><Link href={`/services/${s.slug}`}>EXPLORE SERVICE <span aria-hidden="true">↗</span></Link></article>)}</div>
  </div></section>
  <section className="about section" id="about"><div className="wrap about-grid">
   <div className="about-visual"><div className="about-image" role="img" aria-label="Contemporary concrete architectural construction"/><div className="orange-note"><span className="orange-note-top">STRATA / 001</span>BUILT WITH<br/>PURPOSE. <span aria-hidden="true">↗</span></div></div>
   <div className="about-text"><span className="overline">THE STRATA MINDSET</span><h2>There&apos;s strength<br/>in the details.</h2><p>Every structure tells a story of countless decisions. We believe the right questions, clear expectations and considered coordination shape more successful projects.</p><p>The STRATA concept brings construction planning, material thinking and practical delivery into one cohesive experience.</p><div className="features"><span>↗ Built around the brief</span><span>↗ Quality-conscious planning</span><span>↗ Clearer communication</span><span>↗ End-to-end perspective</span></div><Link className="button dark" href="/about">DISCOVER OUR STORY <span aria-hidden="true">↗</span></Link></div>
  </div></section>
  <section className="section portfolio-section" id="projects"><div className="wrap"><div className="section-head"><div><span className="overline">PROJECT POSSIBILITIES</span><h2>A closer look at<br/>what we build.</h2></div><div className="section-action"><p>Discover illustrative project scenarios across commercial, civil and residential construction. Designed to show potential, not claim previous work.</p><Link className="text-link" href="/projects">VIEW ALL CONCEPTS <span aria-hidden="true">↗</span></Link></div></div>
   <div className="project-grid">{projects.map((p,i)=><Link key={p.slug} href={`/projects/${p.slug}`} className="project" style={{backgroundImage:`linear-gradient(0deg,rgba(10,20,24,.88),rgba(10,20,24,.04) 70%),url("${p.image}")`}}><span className="project-index">0{i+1}</span><div className="project-details"><div><span>CONCEPT PROJECT / {p.type.toUpperCase()}</span><h3>{p.title}</h3></div><span className="project-arrow" aria-hidden="true">↗</span></div></Link>)}</div>
   <p className="disclaimer">* All projects and images are illustrative, not a record of completed contracts or actual clients.</p>
  </div></section>
  <section id="process" className="process section"><div className="wrap"><div className="section-head"><div><span className="overline">THE WAY FORWARD</span><h2>Considered from<br/>start to finish.</h2></div><div className="section-action"><p>A clear process makes a difference. Discover how a straightforward journey can keep projects moving.</p><Link href="/process" className="text-link process-link">OUR FULL PROCESS <span aria-hidden="true">↗</span></Link></div></div>
   <div className="steps">{workflow.map(w=><div className="step" key={w.n}><strong>{w.n}</strong><h3>{w.name}</h3><p>{w.summary}</p></div>)}</div>
  </div></section>
  <section className="section materials"><div className="wrap material-grid"><div><span className="overline">MATERIALS & SUPPLY</span><h2>Every strong build<br/>starts with the right<br/><span className="orange-text">materials.</span></h2><p>From aggregates and masonry to site supplies, thoughtful material planning supports the people and processes behind construction.</p><ul><li>Aggregates, sand and stone</li><li>Cement and concrete requirements</li><li>Bricks, blocks and masonry</li><li>General building supplies</li></ul><Link href="/materials" className="button dark">EXPLORE MATERIALS <span aria-hidden="true">↗</span></Link></div><div className="material-visual"><div className="material-image" role="img" aria-label="Construction works and heavy equipment at a job site"/><span>FROM THE GROUND UP <span aria-hidden="true">↗</span></span></div></div></section>
  <SectionCta title="Have something worth building?"/>
 </main>;
}
