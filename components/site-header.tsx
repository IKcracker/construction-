"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Brand } from "./brand";

const links = [
 {label:"Home",href:"/"},
 {label:"About",href:"/about"},
 {label:"Services",href:"/services"},
 {label:"Projects",href:"/projects"},
 {label:"Our Process",href:"/process"},
 {label:"Materials",href:"/materials"},
];
export function SiteHeader(){
 const [open,setOpen]=useState(false);
 const pathname=usePathname();
 return <>
  <div className="utility"><div className="wrap utility-inner"><span><span className="utility-dot" aria-hidden="true"/> CONSTRUCTION. CIVIL WORKS. MATERIALS.</span><Link href="/projects">VIEW OUR CONCEPT PORTFOLIO <span aria-hidden="true">↗</span></Link></div></div>
  <header className="header">
   <div className="wrap header-inner">
    <Brand onClick={()=>setOpen(false)}/>
    <nav className={open?"nav open":"nav"} id="primary-navigation" aria-label="Main navigation">
     {links.map(link=><Link key={link.href} href={link.href} aria-current={pathname===link.href||link.href!=="/"&&pathname.startsWith(link.href+"/")?"page":undefined} onClick={()=>setOpen(false)}>{link.label}</Link>)}
     <Link className="mobile-contact" href="/contact" onClick={()=>setOpen(false)}>REQUEST A QUOTE <span aria-hidden="true">↗</span></Link>
    </nav>
    <Link href="/contact" className="button primary nav-button">LET&apos;S BUILD <span aria-hidden="true">↗</span></Link>
    <button type="button" className="menu-toggle" aria-label={open?"Close navigation":"Open navigation"} aria-controls="primary-navigation" aria-expanded={open} onClick={()=>setOpen(v=>!v)}><span aria-hidden="true">{open?"✕":"☰"}</span></button>
   </div>
  </header>
 </>;
}
