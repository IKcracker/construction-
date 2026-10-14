import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const port = 3127;
const origin = `http://127.0.0.1:${port}`;
const routes = [
  "/", "/about", "/services", "/services/building-construction",
  "/services/civil-engineering", "/services/materials-supply",
  "/projects", "/projects/commercial-development", "/process",
  "/materials", "/contact"
];
const requiredSelectors = [".hero", ".header", ".service-card", ".page-hero", ".contact-form"];
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
    const links = html.match(/<link\b[^>]*\brel="stylesheet"[^>]*>/g) || [];
    const hrefs = links.map(link => link.match(/\bhref="([^"]+)"/)?.[1]).filter(Boolean);
    if (hrefs.length === 0) throw new Error(`No stylesheet link in HTML for ${route}`);
    cssUrl ||= hrefs.find(href => href.includes(".css"));
    console.log(`PASS page ${route}: HTTP ${result.status}, ${hrefs.length} stylesheet link(s)`);
  }
  if (!cssUrl) throw new Error("No CSS URL found in generated HTML");
  const cssResponse = await fetch(new URL(cssUrl, origin));
  if (!cssResponse.ok) throw new Error(`Stylesheet returned HTTP ${cssResponse.status}: ${cssUrl}`);
  const css = await cssResponse.text();
  for (const selector of requiredSelectors) {
    if (!css.includes(selector)) throw new Error(`Required selector ${selector} missing from generated CSS`);
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
