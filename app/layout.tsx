import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const geistSans=Geist({variable:"--font-geist-sans",subsets:["latin"]});
const geistMono=Geist_Mono({variable:"--font-geist-mono",subsets:["latin"]});
export const metadata:Metadata={
 title:{default:"STRATA | Civil & Construction — Concept Website",template:"%s"},
 description:"A fictional South African construction company website concept focused on civil works, materials and project delivery.",
 robots:{index:false,follow:false},
};
export default function RootLayout({children}:LayoutProps<"/">){
 return <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
  <body className="min-h-full flex flex-col"><SiteHeader/>{children}<SiteFooter/></body>
 </html>;
}
