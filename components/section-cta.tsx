import Link from "next/link";
export function SectionCta({title="Have a project in mind?",caption="START YOUR NEXT PROJECT",href="/contact",button="LET'S TALK"}:{title?:string;caption?:string;href?:string;button?:string}) {
  return <section className="cta"><div className="wrap cta-inner"><div><span className="overline">{caption}</span><h2>{title}<br/>Let&apos;s build a plan.</h2></div><Link className="button white" href={href}>{button}<span aria-hidden="true">↗</span></Link></div></section>;
}
