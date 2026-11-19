#!/usr/bin/env node
/**
 * Creates today's issue file from the template.
 *
 *   npm run new-issue                 → content/issues/<today>.mdx
 *   npm run new-issue -- 2026-11-20   → content/issues/2026-11-20.mdx
 *
 * "Today" means today in New York (market time), even if your laptop
 * is set to a different time zone. The new file starts as a draft:
 * it shows up in `npm run dev` but stays off the live site until you
 * delete the `draft: true` line.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const issuesDir = path.join(root, "content", "issues");
const templatePath = path.join(issuesDir, "_template.mdx");

// 1. Work out the date
const arg = process.argv[2];
const date = arg ?? new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // en-CA = YYYY-MM-DD

if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
  console.error(`✗ "${date}" isn't a valid date. Use YYYY-MM-DD, e.g. npm run new-issue -- 2026-11-20`);
  process.exit(1);
}

// 2. Don't overwrite an existing issue
const target = path.join(issuesDir, `${date}.mdx`);
const relative = path.relative(root, target);
if (fs.existsSync(target)) {
  console.error(`✗ ${relative} already exists. Open it and keep editing, or pass a different date.`);
  process.exit(1);
}

// 3. Copy the template
if (!fs.existsSync(templatePath)) {
  console.error(`✗ Template not found at ${path.relative(root, templatePath)}.`);
  process.exit(1);
}
fs.mkdirSync(issuesDir, { recursive: true });
fs.copyFileSync(templatePath, target);

// 4. Friendly next steps
const weekday = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
console.log(`✓ Created ${relative} (${weekday})`);
if (weekday === "Saturday" || weekday === "Sunday") {
  console.log("  Heads up: that's a weekend. Markets are closed, so double-check the date.");
}
console.log(`
Next steps:
  1. Open ${relative} and replace the placeholder text.
  2. Preview it with npm run dev → http://localhost:3000/archive/${date}
  3. When it's ready, delete the line "draft: true" to publish it.
`);
