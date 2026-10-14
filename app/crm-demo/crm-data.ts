export type ModuleKey = "tenders" | "quotes" | "projects" | "clients" | "tasks" | "documents";
export type ViewKey = "overview" | ModuleKey | "insights";
export type CrmRecord = {
 id:string; title:string; client:string; owner:string; status:string;
 amount:number; date:string; description:string; progress?:number; sourceId?:string; isSample?:boolean;
};
export type CrmStore = Record<ModuleKey,CrmRecord[]>;
export const modules:ModuleKey[]=["tenders","quotes","projects","clients","tasks","documents"];
export const menu: {key:ViewKey;label:string;icon:string;group:string}[]=[
 {key:"overview",label:"Overview",icon:"layout-dashboard",group:"WORKSPACE"},
 {key:"tenders",label:"Tenders & RFQs",icon:"file-search",group:"OPERATIONS"},
 {key:"quotes",label:"Estimates & Quotes",icon:"receipt",group:"OPERATIONS"},
 {key:"projects",label:"Projects",icon:"hard-hat",group:"OPERATIONS"},
 {key:"clients",label:"Companies & Contacts",icon:"users",group:"RELATIONSHIPS"},
 {key:"tasks",label:"Tasks & Follow-ups",icon:"check-square",group:"RELATIONSHIPS"},
 {key:"documents",label:"Document Register",icon:"folder-open",group:"RELATIONSHIPS"},
 {key:"insights",label:"Insights",icon:"chart-column",group:"REPORTING"}
];
export const config:Record<ModuleKey,{singular:string;title:string;subtitle:string;columns:[string,string,string,string];statuses:string[];button:string;placeholder:string}> = {
 tenders:{singular:"Tender",title:"Tenders & RFQs",subtitle:"Track opportunities, deadlines, bid preparation and award decisions.",columns:["Reference / Opportunity","Client","Tender Value","Closing Date"],statuses:["New","Qualification","In Preparation","Submitted","Awarded","Declined"],button:"New tender",placeholder:"e.g. 132kV Substation Civil Works"},
 quotes:{singular:"Quote",title:"Estimates & Quotations",subtitle:"Monitor commercial submissions from draft to customer approval.",columns:["Quotation","Customer","Estimate Value","Valid Until"],statuses:["Draft","Under Review","Sent","Approved","Rejected"],button:"New quotation",placeholder:"e.g. Transformer Bay Civil Package"},
 projects:{singular:"Project",title:"Project Delivery",subtitle:"Keep schedules, owners, budgets and delivery milestones in view.",columns:["Project","Customer","Contract Value","Target Handover"],statuses:["Planning","Active","At Risk","On Hold","Completed"],button:"New project",placeholder:"e.g. West Ridge Substation Upgrade"},
 clients:{singular:"Contact",title:"Companies & Contacts",subtitle:"A single view of engineering partners, customers and project stakeholders.",columns:["Contact","Organisation","Account Value","Next Follow-up"],statuses:["Prospect","Active","Partner","Dormant"],button:"New contact",placeholder:"e.g. Lerato Molefe"},
 tasks:{singular:"Task",title:"Tasks & Follow-ups",subtitle:"See who owns each action, when it is due and what is still outstanding.",columns:["Action","Related To","Priority Value","Due Date"],statuses:["To Do","In Progress","Blocked","Done"],button:"New task",placeholder:"e.g. Submit commercial clarification"},
 documents:{singular:"Document",title:"Document Register",subtitle:"Track required submissions, approval status and document ownership.",columns:["Document","Related To","Document Value","Review Date"],statuses:["Requested","In Review","Approved","Expired"],button:"New document",placeholder:"e.g. Method Statement - Civil Works"}
};
export const firstStore:CrmStore={
 tenders:[
  {id:"TND-1048",title:"132kV Substation Civils & Ducting",client:"Northbank Energy",owner:"Naledi Mokoena",status:"In Preparation",amount:4250000,date:"2026-10-29",description:"Civil works, equipment foundations, cable trenches and duct banks for a fictional power infrastructure tender."},
  {id:"TND-1047",title:"Municipal Road Rehabilitation",client:"Riverton Engineering",owner:"Daniel Jacobs",status:"Submitted",amount:2780000,date:"2026-11-06",description:"Road rehabilitation, drainage improvements and surface reinstatement. Awaiting commercial feedback."},
  {id:"TND-1046",title:"Industrial Warehouse Foundations",client:"Cedar Industrial Group",owner:"Karabo Dlamini",status:"Qualification",amount:1640000,date:"2026-11-12",description:"Geotechnical coordination, excavation, concrete foundations and floor slabs."},
  {id:"TND-1045",title:"11kV Yard Upgrade Works",client:"Northbank Energy",owner:"Naledi Mokoena",status:"Awarded",amount:920000,date:"2026-10-18",description:"Awarded electrical yard minor civils package, ready for project handover."},
  {id:"TND-1044",title:"Waterline & Reservoir Upgrade",client:"Umoya Infrastructure",owner:"Daniel Jacobs",status:"New",amount:3280000,date:"2026-11-20",description:"Potential civils subcontracting opportunity for treatment works and waterline tie-ins."}
 ],
 quotes:[
  {id:"Q-2086",title:"Transformer Bay Civil Package",client:"Northbank Energy",owner:"Karabo Dlamini",status:"Under Review",amount:780000,date:"2026-11-02",description:"Detailed excavation, concrete and drainage estimate prepared for internal commercial review."},
  {id:"Q-2085",title:"Site Access & Hardstand",client:"Cedar Industrial Group",owner:"Daniel Jacobs",status:"Sent",amount:360000,date:"2026-10-31",description:"Site establishment, grading and compacted hardstand works."},
  {id:"Q-2084",title:"Switchyard Cable Trenching",client:"Riverton Engineering",owner:"Naledi Mokoena",status:"Approved",amount:275000,date:"2026-10-26",description:"Approved quotation for cable trench excavation and reinstatement."},
  {id:"Q-2083",title:"Concrete Slab Extension",client:"Cedar Industrial Group",owner:"Karabo Dlamini",status:"Draft",amount:155000,date:"2026-11-15",description:"Draft quantity estimate awaiting final material take-offs."}
 ],
 projects:[
  {id:"PRJ-3009",title:"West Ridge Substation Upgrade",client:"Northbank Energy",owner:"Naledi Mokoena",status:"Active",amount:4600000,date:"2026-12-18",progress:68,description:"Fictional active project: equipment foundations, drainage, access and cable routes."},
  {id:"PRJ-3008",title:"Southpoint Industrial Park Civils",client:"Cedar Industrial Group",owner:"Daniel Jacobs",status:"At Risk",amount:2980000,date:"2026-11-28",progress:42,description:"Fictional project with a drainage approval dependency requiring management attention."},
  {id:"PRJ-3007",title:"Mandla Bridge Refurbishment",client:"Umoya Infrastructure",owner:"Karabo Dlamini",status:"Active",amount:1720000,date:"2027-01-20",progress:35,description:"Structural repairs, earthworks and rehabilitation of bridge approach roads."},
  {id:"PRJ-3006",title:"Northern Estate Earthworks",client:"Riverton Engineering",owner:"Daniel Jacobs",status:"Completed",amount:850000,date:"2026-09-30",progress:100,description:"Completed fictional earthworks reference for demo reporting only."}
 ],
 clients:[
  {id:"CON-0018",title:"Lerato Molefe",client:"Northbank Energy",owner:"Commercial Director",status:"Active",amount:0,date:"2026-10-23",description:"Procurement contact. Email: lerato@example.com. All records are fictitious."},
  {id:"CON-0017",title:"Sipho Dube",client:"Riverton Engineering",owner:"Project Engineer",status:"Partner",amount:0,date:"2026-10-27",description:"Engineering contact. Email: sipho@example.com. All records are fictitious."},
  {id:"CON-0016",title:"Amira Naidoo",client:"Cedar Industrial Group",owner:"Facilities Manager",status:"Prospect",amount:0,date:"2026-11-04",description:"Facilities and capital works contact. Email: amira@example.com. All records are fictitious."},
  {id:"CON-0015",title:"Tshepo Kgosi",client:"Umoya Infrastructure",owner:"Project Lead",status:"Active",amount:0,date:"2026-10-30",description:"Project sponsor. Email: tshepo@example.com. All records are fictitious."}
 ],
 tasks:[
  {id:"TSK-0668",title:"Submit tender clarifications",client:"132kV Substation Civils",owner:"Naledi Mokoena",status:"In Progress",amount:0,date:"2026-10-19",description:"Confirm cable duct specifications and sign off the pricing clarifications."},
  {id:"TSK-0667",title:"Review drainage variation",client:"Southpoint Industrial Park",owner:"Daniel Jacobs",status:"Blocked",amount:0,date:"2026-10-16",description:"Review variation cost once revised drainage drawing is received."},
  {id:"TSK-0666",title:"Schedule project kickoff",client:"11kV Yard Upgrade",owner:"Karabo Dlamini",status:"To Do",amount:0,date:"2026-10-22",description:"Arrange internal handover, RAMS review and mobilisation checklist."},
  {id:"TSK-0665",title:"Approve estimate breakdown",client:"Transformer Bay Civil Package",owner:"Naledi Mokoena",status:"Done",amount:0,date:"2026-10-11",description:"Commercial approval recorded for example scenario."}
 ],
 documents:[
  {id:"DOC-0193",title:"Health & Safety Plan",client:"West Ridge Substation",owner:"Naledi Mokoena",status:"Approved",amount:0,date:"2026-10-28",description:"Demo metadata only; no actual uploaded document or regulatory certification."},
  {id:"DOC-0192",title:"Tender Compliance Checklist",client:"132kV Substation Civils",owner:"Daniel Jacobs",status:"In Review",amount:0,date:"2026-10-25",description:"Checklist of submission requirements. No attachment is stored."},
  {id:"DOC-0191",title:"Construction Method Statement",client:"Southpoint Industrial Park",owner:"Karabo Dlamini",status:"Requested",amount:0,date:"2026-10-20",description:"Requested method statement for client review."},
  {id:"DOC-0190",title:"Insurance Certificate Register",client:"Company Compliance",owner:"Naledi Mokoena",status:"Expired",amount:0,date:"2026-09-30",description:"Fictional expiry example for demonstration. No actual insurance document."}
 ]
};
export const money=(n:number)=>new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR",maximumFractionDigits:0}).format(n);
export const shortMoney=(n:number)=>n>=1000000?"R"+(n/1000000).toFixed(2)+"m":n>=1000?"R"+Math.round(n/1000)+"k":money(n);
export const dateLabel=(date:string)=>date?new Date(date+"T12:00:00").toLocaleDateString("en-ZA",{day:"numeric",month:"short",year:"numeric"}):"—";
export const stageClass=(status:string)=>["At Risk","Blocked","Declined","Rejected","Expired"].includes(status)?"danger":["Awarded","Approved","Completed","Done","Active"].includes(status)?"success":["Submitted","Sent","In Progress","In Preparation","Under Review"].includes(status)?"info":"neutral";
export const seedClone=():CrmStore=>structuredClone(firstStore);
