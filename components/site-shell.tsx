"use client";
import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import type { ReactNode } from "react";

export function SiteShell({children}:{children:ReactNode}){
 const pathname=usePathname();
 if(pathname.startsWith("/crm")) return <>{children}</>;
 return <><SiteHeader/>{children}<SiteFooter/></>;
}
