import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteShell } from "@/components/site-shell";
import { Suspense } from "react";
import "./globals.css";
// Load FORGE styles from the root layout so private streamed pages never render unstyled.
// All CRM selectors are .forge-* scoped; this does not change STRATA page styling.
import "./crm-demo/crm.css";
import "./crm/auth.css";
import "./crm/workspace.css";

const geistSans=Geist({variable:"--font-geist-sans",subsets:["latin"]});
const geistMono=Geist_Mono({variable:"--font-geist-mono",subsets:["latin"]});
export const metadata:Metadata={
 title:{default:"STRATA | Civil & Construction — Concept Website",template:"%s"},
 description:"A fictional South African construction company website concept focused on civil works, materials and project delivery.",
 robots:{index:false,follow:false},
};
export default function RootLayout({children}:LayoutProps<"/">){
 return <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
  <body className="min-h-full flex flex-col"><Suspense fallback={<div role="status" style={{padding:"24px",color:"#52636b"}}>Loading page…</div>}><SiteShell>{children}</SiteShell></Suspense></body>
 </html>;
}
