#!/usr/bin/env node
/**
 * Send today's issue (manually).
 *
 *   npm run send-issue                         → dry run: checks everything, sends nothing
 *   npm run send-issue -- --test you@emory.edu → sends ONE test copy to you
 *   npm run send-issue -- --send               → sends to all subscribers (asks you to confirm)
 *
 * Extra options:
 *   --url https://your-site.vercel.app   use the live site instead of localhost
 *   --force                              send even if the issue isn't dated today
 *
 * Needs CRON_SECRET in .env.local, and the site running (npm run dev) when using localhost.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, ".env.local");
if (fs.existsSync(envFile)) process.loadEnvFile(envFile); // built into Node 20.12+

// ── Parse arguments ──
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const testTo = value("test");
const mode = flag("send") ? "send" : testTo ? "test" : "dry-run";
const baseUrl = (value("url") ?? "http://localhost:3000").replace(/\/$/, "");
const secret = process.env.CRON_SECRET;

if (!secret) {
  console.error("✗ CRON_SECRET is missing from .env.local. Add any long random string, e.g.:");
  console.error(`  CRON_SECRET=${cryptoRandom()}`);
  process.exit(1);
}
if (flag("test") && !testTo) {
  console.error("✗ Add an email after --test, e.g. npm run send-issue -- --test you@emory.edu");
  process.exit(1);
}

// ── Confirm before emailing everyone ──
if (mode === "send") {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`This emails ALL subscribers via ${baseUrl}. Type "send" to continue: `);
  rl.close();
  if (answer.trim().toLowerCase() !== "send") {
    console.log("Cancelled. Nothing was sent.");
    process.exit(0);
  }
}

// ── Call the API route ──
const qs = new URLSearchParams({ mode });
if (testTo) qs.set("to", testTo);
if (flag("force")) qs.set("force", "1");

let res;
try {
  res = await fetch(`${baseUrl}/api/send-issue?${qs}`, {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
  });
} catch {
  console.error(`✗ Couldn't reach ${baseUrl}. Is the site running? (npm run dev)`);
  process.exit(1);
}

const body = await res.json().catch(() => ({}));
console.log(JSON.stringify(body, null, 2));

if (!res.ok) process.exit(1);
if (mode === "dry-run") {
  console.log(`\nDry run only. Nothing was sent. Preview the email at ${baseUrl}/api/email-preview`);
}

function cryptoRandom() {
  return [...crypto.getRandomValues(new Uint8Array(24))].map((b) => b.toString(16).padStart(2, "0")).join("");
}
