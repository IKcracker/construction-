type Props = { slug: string; className?: string };
export function ServiceIcon({slug,className="service-icon-svg"}:Props) {
  const shared = { fill: "none", stroke: "currentColor", strokeWidth: 1.65, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  let drawing;
  switch(slug) {
    case "building-construction":
      drawing=<><path d="M5 42h38M10 42V17l14-9 14 9v25M17 42V28h14v14M10 21h28M18 15h12"/></>;break;
    case "civil-engineering":
      drawing=<><path d="M5 40h38M8 32l7-17 9 17 9-17 7 17M4 34h40M24 8v7M20 12h8M11 40v-6M37 40v-6"/></>;break;
    case "materials-supply":
      drawing=<><path d="m24 5 17 9-17 9-17-9 17-9ZM7 14v19l17 10 17-10V14M24 23v20M15 19l17-10M32 19 15 9"/></>;break;
    case "project-management":
      drawing=<><rect x="9" y="8" width="30" height="35" rx="2"/><path d="M18 8V5h12v3M16 18h8M16 25h8M16 32h7m5-12 2 2 4-5m-6 12 2 2 4-5"/></>;break;
    case "renovations-upgrades":
      drawing=<><path d="M6 23 24 8l18 15M12 22v19h24V22M19 41V29h10v12M30 13V7h6v11M14 14l-5-5"/></>;break;
    case "site-preparation":
      drawing=<><path d="M4 40h40M9 34h27M15 34 23 9M23 9l6 3-8 22M9 21l11 4M28 34l6-14 7 14M8 16l6-5"/></>;break;
    default:
      drawing=<><path d="M8 40V12h32v28M4 40h40M17 23h14M17 31h14"/></>;
  }
  return <svg className={className} viewBox="0 0 48 48" {...shared} aria-hidden="true" focusable="false">{drawing}</svg>;
}
