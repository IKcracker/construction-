import Link from "next/link";
type Props={eyebrow:string;title:string;description:string;image:string;crumb:string};
export function PageHero({eyebrow,title,description,image,crumb}:Props){
 return <section className="page-hero" aria-labelledby="page-heading" style={{backgroundImage:`linear-gradient(90deg,rgba(14,24,29,.97) 0%,rgba(14,24,29,.88) 40%,rgba(14,24,29,.32) 100%),url("${image}")`}}>
  <div className="wrap page-hero-inner">
   <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">HOME</Link><span aria-hidden="true">/</span><span>{crumb}</span></nav>
   <span className="overline">{eyebrow}</span><h1 id="page-heading">{title}</h1><p>{description}</p>
  </div>
  <div className="page-hero-index"><div className="wrap"><span>STRATA / CIVIL &amp; CONSTRUCTION</span><span>CONCEPT WEBSITE <b aria-hidden="true">↗</b></span></div></div>
 </section>;
}
