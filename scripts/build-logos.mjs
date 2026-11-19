#!/usr/bin/env node
/**
 * Exports the logos as standalone SVG files in brand/.
 *
 *   npm run logos
 *
 * Letters are converted from the Fraunces font into vector shapes, so the
 * files look identical everywhere, even on computers without the font.
 * Use these for stickers, slides, social avatars, or a designer.
 *
 * The site itself draws the primary logo in components/Logo.tsx; this
 * script is only for exported files and the backup interlock concepts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "brand");
const font = opentype.parse(fs.readFileSync(path.join(root, "assets/fonts/fraunces-latin-600-normal.woff")).buffer);

const NAVY = "#012169";
const LIGHT = "#B9D9EB";
const WHITE = "#FFFFFF";

/**
 * SVG path for `text`, centered on (cx, ·), with the letters' visual top at `top`.
 * Returns { d, box } where box is the drawn bounding box.
 */
function letters(text, size, cx, top) {
  const probe = font.getPath(text, 0, 0, size).getBoundingBox();
  const x = cx - (probe.x1 + probe.x2) / 2;
  const y = top - probe.y1; // baseline that puts the glyph top at `top`
  const p = font.getPath(text, x, y, size);
  return { d: p.toPathData(2), box: p.getBoundingBox() };
}

const svg = (body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="512" height="512" role="img" aria-label="${title}">\n<title>${title}</title>\n${body}\n</svg>\n`;

const tile = (fill = NAVY) => `<rect width="64" height="64" rx="14" fill="${fill}"/>`;

/* ───────────── Primary: Ledger monogram (live on the site) ───────────── */

function primary() {
  const gv = letters("GV", 25, 32, 20);
  return svg(
    [
      tile(),
      `<path d="${gv.d}" fill="${WHITE}"/>`,
      `<line x1="16" y1="47" x2="48" y2="47" stroke="${LIGHT}" stroke-width="1.6" stroke-linecap="round"/>`,
      `<line x1="16" y1="51.5" x2="48" y2="51.5" stroke="${LIGHT}" stroke-width="1.6" stroke-linecap="round" stroke-opacity="0.55"/>`,
    ].join("\n"),
    "The Georgia Variant logo",
  );
}

/* ───────────── Backup: Stacked (G over V) ───────────── */

function stacked() {
  const g = letters("G", 23, 32, 12);
  const v = letters("V", 23, 32, 38.5);
  return svg(
    [
      tile(),
      `<path d="${g.d}" fill="${WHITE}"/>`,
      `<line x1="20" y1="34" x2="44" y2="34" stroke="${LIGHT}" stroke-width="1.6" stroke-linecap="round"/>`,
      `<path d="${v.d}" fill="${LIGHT}"/>`,
    ].join("\n"),
    "The Georgia Variant logo, stacked",
  );
}

/* ───────────── Backup: Interlock family ─────────────
 * G sits high and centered; a V hangs below it with its arms rising up
 * into the G's lower half. A thin "gap" in the background color around
 * the V keeps the two letters distinct, even at favicon size.
 */
const V_STROKE = 4.6; // matches the G's stem weight at this size
const GAP = 2.2; // background-colored outline around the V

function interlockParts() {
  const g = letters("G", 35, 32, 7);
  const vPath = "M20.5 26 L32 57 L43.5 26"; // V arms start inside the G's bowl
  return { g, vPath };
}

/** Over/under weave: V passes over the G on the left, under it on the right */
function interlock({ bg = NAVY, gFill = WHITE, vFill = LIGHT, woven = false, title }) {
  const { g, vPath } = interlockParts();
  const vGap = `<path d="${vPath}" fill="none" stroke="${bg}" stroke-width="${V_STROKE + GAP * 2}" stroke-linejoin="miter"/>`;
  const v = `<path d="${vPath}" fill="none" stroke="${vFill}" stroke-width="${V_STROKE}" stroke-linejoin="miter"/>`;
  const parts = [bg === NAVY ? tile() : tile(bg), `<path d="${g.d}" fill="${gFill}"/>`, vGap, v];

  if (woven) {
    // Redraw the right side of the G on top of the V's right arm (with its own gap)
    parts.push(
      `<clipPath id="weave"><rect x="35" y="18" width="14" height="16"/></clipPath>`,
      `<g clip-path="url(#weave)"><path d="${g.d}" fill="${gFill}" stroke="${bg}" stroke-width="${GAP * 1.4}" paint-order="stroke"/></g>`,
    );
  }
  return svg(parts.join("\n"), title);
}

/* ───────────── Write files ───────────── */

const files = {
  "logo-primary.svg": primary(),
  "logo-stacked.svg": stacked(),
  "interlock-centered.svg": interlock({ title: "Interlock logo, centered" }),
  "interlock-woven.svg": interlock({ woven: true, title: "Interlock logo, woven" }),
  "interlock-mono.svg": interlock({ woven: true, vFill: WHITE, title: "Interlock logo, one color" }),
  "interlock-light.svg": interlock({ woven: true, bg: WHITE, gFill: NAVY, vFill: "#3D6FB6", title: "Interlock logo, light background" }),
};

fs.mkdirSync(outDir, { recursive: true });
for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, name), content);
  console.log(`✓ brand/${name}`);
}

// A simple page to compare them side by side (open brand/preview.html in a browser)
const preview = `<!doctype html><meta charset="utf-8"><title>Logo preview</title>
<style>body{font-family:system-ui,sans-serif;margin:40px;background:#f4f6fa;color:#1f2937}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px}
.card{background:#fff;border-radius:16px;padding:20px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.sizes{display:flex;gap:12px;justify-content:center;align-items:center;margin-top:14px}
img{display:block}</style>
<h1>The Georgia Variant: logos</h1><div class="grid">
${Object.keys(files)
  .map(
    (f) => `<div class="card"><img src="${f}" width="128" height="128" style="margin:0 auto" alt="">
<div class="sizes"><img src="${f}" width="48" height="48" alt=""><img src="${f}" width="32" height="32" alt=""><img src="${f}" width="16" height="16" alt=""></div>
<p>${f}</p></div>`,
  )
  .join("\n")}
</div>`;
fs.writeFileSync(path.join(outDir, "preview.html"), preview);
console.log("✓ brand/preview.html (open it in a browser to compare)");
