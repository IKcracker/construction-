import Link from "next/link";
export function SiteFooter() {
  return <>
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div><Link href="/" className="logo"><span className="logo-emblem" aria-hidden="true">◢</span><span>STRATA<small>CIVIL & CONSTRUCTION</small></span></Link><p>Fictional construction and civil engineering branding created for a premium website concept. Project imagery and service information are illustrative.</p></div>
          <div><h4>EXPLORE</h4><Link href="/about">About</Link><Link href="/services">All Services</Link><Link href="/projects">Concept Projects</Link><Link href="/process">Our Approach</Link></div>
          <div><h4>MORE</h4><Link href="/materials">Materials Supply</Link><Link href="/contact">Enquiry Form</Link><Link href="/contact">Contact</Link><Link href="/">Back to Home</Link></div>
        </div>
        <div className="footer-bottom"><span>© 2026 STRATA — fictional concept identity.</span><span>DEMO EXPERIENCE • NOT AN OFFICIAL COMPANY WEBSITE</span></div>
      </div>
    </footer>
    <div className="demo-tag">CONCEPT WEBSITE · SAMPLE CONTENT</div>
  </>;
}
