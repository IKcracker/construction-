import Link from "next/link";
import { Brand } from "./brand";
export function SiteFooter(){
 return <>
  <footer className="footer">
   <div className="wrap">
    <div className="footer-upper"><div className="footer-intro"><span className="overline">BUILD WITH INTENTION</span><h2>Good things start<br/>with solid foundations.</h2><p>A fictional, construction-focused concept experience showcasing how a professional contractor could communicate capability and invite enquiries.</p><Link href="/contact" className="button primary">START A CONVERSATION <span aria-hidden="true">↗</span></Link></div><div className="footer-meta"><span>01 / CIVIL WORKS</span><span>02 / CONSTRUCTION</span><span>03 / MATERIALS</span><span>04 / PROJECT DELIVERY</span></div></div>
    <div className="footer-grid"><div><Brand light/><p>Built for the people who build what comes next. STRATA is a fictional concept brand; all project examples are illustrative.</p></div>
     <div><h4>DISCOVER</h4><Link href="/about">About our concept</Link><Link href="/services">Our capabilities</Link><Link href="/projects">Project showcase</Link><Link href="/process">How we work</Link></div>
     <div><h4>EXPLORE</h4><Link href="/materials">Materials & supply</Link><Link href="/services/civil-engineering">Civil engineering</Link><Link href="/services/building-construction">Building construction</Link><Link href="/contact">Enquiry form</Link></div>
    </div>
    <div className="footer-bottom"><span>© 2026 STRATA. Fictional design concept.</span><span>EXAMPLE CONTENT ONLY · NOT AN OFFICIAL COMPANY WEBSITE</span><Link href="/">BACK TO TOP ↑</Link></div>
   </div>
  </footer>
  <div className="demo-tag">DESIGN CONCEPT <span aria-hidden="true">•</span> SAMPLE CONTENT</div>
 </>;
}
