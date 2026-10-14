import Link from "next/link";
type Props = {eyebrow:string; title:string; description:string; image:string; crumb:string};
export function PageHero({eyebrow,title,description,image,crumb}:Props) {
  return <section className="page-hero" style={{backgroundImage:"linear-gradient(90deg,rgba(13,23,28,.96),rgba(13,23,28,.7) 60%,rgba(13,23,28,.35)),url("+image+")"}}>
    <div className="wrap page-hero-inner">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>{crumb}</span></nav>
      <span className="overline">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    <div className="page-hero-index"><div className="wrap">STRATA / CIVIL & CONSTRUCTION <span>CONCEPT WEBSITE</span></div></div>
  </section>;
}
