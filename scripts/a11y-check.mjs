#!/usr/bin/env node
/**
 * Accessibility check: runs axe-core (the standard open-source checker)
 * against every main page and lists any WCAG problems.
 *
 *   npm run dev          (in one terminal)
 *   npm run a11y         (in another)
 *
 * Options: --url https://your-site.vercel.app to check the live site.
 *
 * Note: this runs without a real browser, so it can't measure color
 * contrast (that needs real rendering). Contrast for our color tokens
 * was checked separately and is documented in app/globals.css.
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import { JSDOM, VirtualConsole } from "jsdom";

const require = createRequire(import.meta.url);
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const args = process.argv.slice(2);
const urlIdx = args.indexOf("--url");
const base = (urlIdx >= 0 ? args[urlIdx + 1] : "http://localhost:3000").replace(/\/$/, "");

const pages = [
  "/",
  "/market-pulse",
  "/macro",
  "/variant-view",
  "/variant-view/2026-11-16-DG",
  "/founders",
  "/founders/jordan-placeholder",
  "/archive",
  "/archive/2026-11-18",
  "/about",
  "/this-page-does-not-exist",
];

let total = 0;
for (const path of pages) {
  let html;
  try {
    html = await (await fetch(base + path)).text();
  } catch {
    console.error(`✗ Couldn't reach ${base}. Is the site running? (npm run dev)`);
    process.exit(1);
  }

  // Load the page's HTML (no page scripts run), then run axe inside it
  const dom = new JSDOM(html, { url: base + path, runScripts: "outside-only", virtualConsole: new VirtualConsole() });
  dom.window.eval(axeSource);
  const results = await dom.window.axe.run(dom.window.document, {
    runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"],
    rules: { "color-contrast": { enabled: false } }, // needs a real browser; checked separately
  });

  const v = results.violations;
  total += v.length;
  console.log(`${v.length === 0 ? "✓" : "✗"} ${path}${v.length ? `: ${v.length} issue(s)` : ""}`);
  for (const issue of v) {
    console.log(`    [${issue.impact}] ${issue.id}: ${issue.help}`);
    for (const node of issue.nodes.slice(0, 3)) console.log(`        at ${node.target.join(" ")}`);
  }
  dom.window.close();
}

console.log(total === 0 ? "\nNo accessibility issues found." : `\n${total} issue type(s) found.`);
process.exit(total === 0 ? 0 : 1);
