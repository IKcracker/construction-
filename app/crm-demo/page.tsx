import type { Metadata } from "next";
import { CRMShowcase } from "./crm-showcase";
import "./crm.css";

export const metadata:Metadata={
 title:"FORGE | Construction CRM Demo — Code Tech Agency",
 description:"Explore the interactive FORGE construction CRM showcase with sample tenders, quotations, projects and client workflows by Code Tech Agency.",
 robots:{index:false,follow:false}
};
export default function CRMPage(){return <CRMShowcase/>;}
