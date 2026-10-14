import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const port = 3127;
const origin = `http://127.0.0.1:${port}`;
const routes = [
  "/", "/about", "/services", "/services/building-construction",
  "/services/civil-engineering", "/services/materials-supply",
  "/projects", "/projects/commercial-development", "/process",
  "/materials", "/contact", "/crm", "/crm-demo"
];
const requiredSelectors = [".hero", ".header", ".service-card", ".page-hero", ".contact-form", ".footer .footer-grid"];
const footerCssSource=readFileSync("app/globals.css","utf8");
for (const rule of [
  "@media (max-width: 960px)",
  "@media (max-width: 600px)",
  "grid-template-columns:repeat(2,minmax(0,1fr))",
  "grid-template-columns:minmax(0,1fr)",
  "overflow-wrap:break-word"
]) {
  if (!footerCssSource.includes(rule)) {
    throw new Error("Responsive footer CSS missing required rule: "+rule);
  }
}
console.log("PASS responsive footer breakpoints and overflow guards");

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", String(port)], {
  env: { ...process.env, NODE_ENV: "production" },
  stdio: ["ignore", "pipe", "pipe"]
});
let logs = "";
server.stdout.on("data", chunk => { logs += String(chunk); });
server.stderr.on("data", chunk => { logs += String(chunk); });

async function main() {
  let ready = false;
  for (let i = 0; i < 45; i++) {
    if (server.exitCode !== null) break;
    try {
      const response = await fetch(origin + "/");
      if (response.ok) { ready = true; break; }
    } catch { /* server is starting */ }
    await sleep(1000);
  }
  if (!ready) throw new Error("Production server did not start.\n" + logs);

  let cssUrl = null;
  for (const route of routes) {
    const result = await fetch(origin + route);
    const html = await result.text();
    if (!result.ok) throw new Error(`Route ${route} returned HTTP ${result.status}`);
    // Page hero headings should never expose escaped newline markers to visitors.
    const heading=html.split('id="page-heading"')[1]?.split("</h1>")[0];
    if (heading && heading.includes("\\n")) {
      throw new Error(`Page hero contains literal escaped newline text on ${route}`);
    }
    const links = html.match(/<link\b[^>]*\brel="stylesheet"[^>]*>/g) || [];
    const hrefs = links.map(link => link.match(/\bhref="([^"]+)"/)?.[1]).filter(Boolean);
    if (hrefs.length === 0) throw new Error(`No stylesheet link in HTML for ${route}`);
    if (route === "/crm" || route === "/crm-demo") {
      if (!html.includes("FORGE") || !html.includes("configuration required")) {
        throw new Error("Private CRM should render only a setup screen when database credentials are absent");
      }
      if (html.includes("Tender pipeline") || html.includes("CONCEPT WEBSITE · SAMPLE CONTENT")) {
        throw new Error("Private CRM leaked internal records or public marketing shell");
      }
      const styles=await Promise.all(hrefs.map(async href => {
        const cssResult=await fetch(new URL(href,origin));
        if(!cssResult.ok)throw new Error("CRM stylesheet failed to load");
        return cssResult.text();
      }));
      const crmCss=styles.join("\n");
      for(const selector of [".forge-app",".forge-sidebar",".forge-table",".forge-drawer"]) {
        if(!crmCss.includes(selector))throw new Error("Missing production CRM styling: "+selector);
      }
      console.log("PASS private CRM sign-in gate and isolated layout");
    }
    cssUrl ||= hrefs.find(href => href.includes(".css"));
    console.log(`PASS page ${route}: HTTP ${result.status}, ${hrefs.length} stylesheet link(s)`);
  }
  // A public visitor must never be able to access organization records or staff lists.
  for (const privatePath of ["/api/forge/records","/api/forge/users","/api/forge/me"]) {
    const response=await fetch(origin+privatePath);
    if(response.status!==401)throw new Error(`Unprotected CRM endpoint ${privatePath}: HTTP ${response.status}`);
    console.log(`PASS unauthorized CRM API ${privatePath}: HTTP 401`);
  }
  if (!cssUrl) throw new Error("No CSS URL found in generated HTML");
  const cssResponse = await fetch(new URL(cssUrl, origin));
  if (!cssResponse.ok) throw new Error(`Stylesheet returned HTTP ${cssResponse.status}: ${cssUrl}`);
  const css = await cssResponse.text();
  for (const selector of requiredSelectors) {
    if (!css.includes(selector)) throw new Error(`Required selector ${selector} missing from generated CSS`);
  }
  // History should not change navigation link colors; link overrides must ship in compiled CSS.
  if (!css.includes(":visited") || !css.includes("#ecf3ef")) {
    throw new Error("Stable visited-link styling or accessible footer-link colour is missing from CSS");
  }
  if (css.length < 8000) throw new Error(`Generated CSS unexpectedly small (${css.length} bytes)`);
  console.log(`PASS stylesheet ${cssUrl} (HTTP ${cssResponse.status}; ${css.length} bytes; ${requiredSelectors.length} selectors)`);
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
}
