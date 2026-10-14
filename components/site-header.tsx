"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  {label:"Home", href:"/"},
  {label:"About", href:"/about"},
  {label:"Services", href:"/services"},
  {label:"Projects", href:"/projects"},
  {label:"Our Process", href:"/process"},
  {label:"Materials", href:"/materials"},
  {label:"Contact", href:"/contact"},
];

export function SiteHeader() {
  const [open,setOpen] = useState(false);
  const pathname = usePathname();
  return <>
    <div className="utility"><div className="wrap utility-inner"><span>BUILT WITH PURPOSE. DELIVERED WITH PRECISION.</span><span>SOUTH AFRICAN CONSTRUCTION CONCEPT</span></div></div>
    <header className="header">
      <div className="wrap header-inner">
        <Link href="/" className="logo" aria-label="STRATA home" onClick={()=>setOpen(false)}>
          <span className="logo-emblem" aria-hidden="true">◢</span>
          <span>STRATA<small>CIVIL & CONSTRUCTION</small></span>
        </Link>
        <button className="menu-toggle" type="button" aria-label={open?"Close navigation":"Open navigation"} aria-controls="primary-navigation" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?"✕":"☰"}</button>
        <nav id="primary-navigation" aria-label="Main navigation" className={open?"nav open":"nav"}>
          {links.map(item => <Link key={item.href} href={item.href} onClick={()=>setOpen(false)} aria-current={pathname===item.href||item.href!=="/"&&pathname.startsWith(item.href+"/")?"page":undefined}>{item.label}</Link>)}
        </nav>
        <Link href="/contact" className="button primary nav-button">LET&apos;S BUILD <span aria-hidden="true">↗</span></Link>
      </div>
    </header>
  </>;
}
