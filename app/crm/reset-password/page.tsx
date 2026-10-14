import type {Metadata} from "next";
import {Suspense} from "react";
import {ForgeResetForm} from "./reset-form";
export const metadata:Metadata={title:"Reset password | FORGE CRM",robots:{index:false,follow:false}};
export default function ResetPage(){return <Suspense fallback={<div className="forge-login-page">Loading recovery…</div>}><ForgeResetForm/></Suspense>}
