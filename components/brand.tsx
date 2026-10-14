import Link from "next/link";
export function Brand({onClick,light=false}:{onClick?:()=>void;light?:boolean}) {
 return <Link href="/" onClick={onClick} className={light?"logo logo-light":"logo"} aria-label="STRATA Civil and Construction, home">
  <span className="logo-emblem" aria-hidden="true"><svg viewBox="0 0 46 46" fill="none" width="46" height="46">
    <path d="M4 37 19 8h10L14 37H4Z" fill="currentColor"/>
    <path d="m26 15 16 22H21l5-10h-7l7-12Z" fill="currentColor"/>
    <path d="M4 42h38" stroke="currentColor" strokeWidth="2"/>
  </svg></span>
  <span className="logo-word">STRATA<small>CIVIL &amp; CONSTRUCTION</small></span>
 </Link>;
}
