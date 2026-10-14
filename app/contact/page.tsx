import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { QuoteForm } from "@/components/quote-form";
export const metadata:Metadata={title:"Contact & Enquiries | STRATA Concept",description:"Preview a construction project enquiry experience on the STRATA fictional website."};
export default function ContactPage(){return <main>
 <PageHero eyebrow="START A CONVERSATION" title="Let's talk about\nyour next project." description="New construction, site works, material planning or a renovation? Every strong project starts with a clear brief." image="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=85" crumb="Contact"/>
 <section className="section"><div className="wrap contact-grid"><div><span className="overline">GET IN TOUCH</span><h2>Tell us what<br/>you&apos;re planning.</h2><p>Use the example form to share your requirements and see how a professional construction enquiry workflow might look.</p><div className="contact-info"><b>FOCUS AREAS</b><span>Building / Civil Works / Materials / Project Management</span><b>PROJECT LOCATION</b><span>South Africa (illustrative service region)</span><b>IMPORTANT</b><span>STRATA is a fictional demo brand. There is no monitored business inbox, quoted pricing or telephone number connected to this website.</span></div><div className="contact-side-note"><strong>Need to explore options first?</strong><p>Browse the example capabilities and project scenarios before submitting a sample request.</p><Link className="text-link" href="/services">VIEW SERVICES <span>↗</span></Link></div></div><QuoteForm/></div></section>
 </main>;}
