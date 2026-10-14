import type { ReactNode } from "react";

export type IconName = "grid"|"bid"|"receipt"|"hardhat"|"users"|"check"|"folder"|"chart"|"search"|"plus"|"arrow"|"down"|"bell"|"calendar"|"clock"|"alert"|"check-circle"|"layers"|"settings"|"menu"|"x"|"pencil"|"trash"|"download"|"refresh"|"more"|"eye"|"filter"|"chevron"|"external"|"briefcase"|"trending"|"shield"|"spark"|"info"|"arrow-right"|"file"|"send";
const shapes:Record<IconName,ReactNode>={
 grid:<><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></>,
 bid:<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h5M8 16h4"/><circle cx="18" cy="17" r="3.5"/></>,
 receipt:<><path d="M5 3h14v18l-3.5-2-3.5 2-3.5-2L5 21V3Z"/><path d="M9 8h6M9 12h6"/></>,
 hardhat:<><path d="M3 17h18M5 17v-3a7 7 0 0 1 14 0v3M10 7V5a2 2 0 0 1 4 0v2M5 17a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3"/></>,
 users:<><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2H3ZM16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1h-3"/></>,
 check:<><path d="m5 12 4 4L19 6"/></>,
 folder:<><path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"/></>,
 chart:<><path d="M4 20V4M4 20h16M8 16v-5M13 16V7M18 16V3"/></>,
 search:<><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
 plus:<><path d="M12 5v14M5 12h14"/></>,
 arrow:<><path d="M5 12h14m-6-6 6 6-6 6"/></>,
 down:<><path d="m6 9 6 6 6-6"/></>,
 bell:<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
 calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
 alert:<><path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v4M12 17h.01"/></>,
 "check-circle":<><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
 layers:<><path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/></>,
 settings:<><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/></>,
 menu:<><path d="M4 6h16M4 12h16M4 18h16"/></>,
 x:<><path d="M5 5 19 19M19 5 5 19"/></>,
 pencil:<><path d="m4 17 12-12 3 3-12 12-4 1 1-4ZM14 7l3 3"/></>,
 trash:<><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></>,
 download:<><path d="M12 3v12m-5-5 5 5 5-5M4 18v3h16v-3"/></>,
 refresh:<><path d="M21 12a9 9 0 0 1-15.4 6.4M3 12A9 9 0 0 1 18.4 5.6M3 18v-6h6M21 6v6h-6"/></>,
 more:<><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
 eye:<><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
 filter:<><path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z"/></>,
 chevron:<><path d="m9 18 6-6-6-6"/></>,
 external:<><path d="M13 4h7v7M20 4 10 14M20 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/></>,
 briefcase:<><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></>,
 trending:<><path d="m3 17 6-6 4 4 8-8M15 7h6v6"/></>,
 shield:<><path d="m12 2 9 4v6c0 6-4.5 9-9 10-4.5-1-9-4-9-10V6l9-4Z"/><path d="m8 12 3 3 5-6"/></>,
 spark:<><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/></>,
 info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,
 "arrow-right":<><path d="M4 12h16m-6-6 6 6-6 6"/></>,
 file:<><path d="M6 2h8l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM14 2v6h5M8 13h8M8 17h7"/></>,
 send:<><path d="m21 3-6.8 18-3.1-8.1L3 9.8 21 3ZM11.1 12.9 21 3"/></>
};
export function Icon({name,size=18,className=""}:{name:IconName;size?:number;className?:string}){
 return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>;
}
