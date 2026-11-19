/**
 * Realistic mock data.
 *
 * Used in two cases:
 *   1. Phase 1, before any API is wired up.
 *   2. Later, as the fallback when an API key is missing or a call fails,
 *      so the site always renders (with a "Sample data" badge).
 *
 * Numbers are illustrative, not real market data.
 */
import type { Mover, Quote, SectorPerf } from "./types";

/** The 10 instruments in the hero ticker strip, in display order */
export const mockTicker: Quote[] = [
  { symbol: "SPX", name: "S&P 500", kind: "index", price: 6912.4, change: 29.07, changePct: 0.0042 },
  { symbol: "NDX", name: "Nasdaq", kind: "index", price: 23481.75, change: 152.48, changePct: 0.0065 },
  { symbol: "DJI", name: "Dow", kind: "index", price: 47852.1, change: -57.4, changePct: -0.0012 },
  { symbol: "RUT", name: "Russell 2000", kind: "index", price: 2478.36, change: 21.7, changePct: 0.0088 },
  { symbol: "US10Y", name: "10Y Yield", kind: "yield", price: 4.12, change: 0.03, changePct: 0 },
  { symbol: "VIX", name: "VIX", kind: "volatility", price: 16.21, change: -0.58, changePct: -0.0345 },
  { symbol: "DXY", name: "DXY", kind: "fx", price: 99.42, change: 0.18, changePct: 0.0018 },
  { symbol: "WTI", name: "Oil (WTI)", kind: "commodity", price: 61.84, change: -0.87, changePct: -0.0139 },
  { symbol: "GOLD", name: "Gold", kind: "commodity", price: 4052.3, change: 21.1, changePct: 0.0052 },
  { symbol: "BTC", name: "Bitcoin", kind: "crypto", price: 92340, change: 1940, changePct: 0.0215 },
];

export const mockGainers: Mover[] = [
  { symbol: "SMCI", name: "Super Micro Computer", price: 48.12, changePct: 0.1184 },
  { symbol: "ANF", name: "Abercrombie & Fitch", price: 112.3, changePct: 0.0921 },
  { symbol: "PLTR", name: "Palantir", price: 184.55, changePct: 0.0612 },
  { symbol: "MU", name: "Micron", price: 141.08, changePct: 0.0477 },
  { symbol: "DAL", name: "Delta Air Lines", price: 61.9, changePct: 0.0391 },
];

export const mockLosers: Mover[] = [
  { symbol: "TGT", name: "Target", price: 88.41, changePct: -0.0812 },
  { symbol: "MRNA", name: "Moderna", price: 24.66, changePct: -0.0654 },
  { symbol: "INTC", name: "Intel", price: 33.12, changePct: -0.0433 },
  { symbol: "NKE", name: "Nike", price: 63.27, changePct: -0.0318 },
  { symbol: "KO", name: "Coca-Cola", price: 69.85, changePct: -0.0201 },
];

/** The 11 SPDR sector ETFs */
export const mockSectors: SectorPerf[] = [
  { symbol: "XLK", name: "Technology", changePct: 0.0121 },
  { symbol: "XLC", name: "Communication", changePct: 0.0074 },
  { symbol: "XLY", name: "Cons. Discretionary", changePct: 0.0038 },
  { symbol: "XLF", name: "Financials", changePct: 0.0029 },
  { symbol: "XLI", name: "Industrials", changePct: 0.0011 },
  { symbol: "XLB", name: "Materials", changePct: -0.0006 },
  { symbol: "XLRE", name: "Real Estate", changePct: -0.0034 },
  { symbol: "XLV", name: "Health Care", changePct: -0.0047 },
  { symbol: "XLP", name: "Cons. Staples", changePct: -0.0062 },
  { symbol: "XLU", name: "Utilities", changePct: -0.0081 },
  { symbol: "XLE", name: "Energy", changePct: -0.0115 },
];

/** Macro snapshot (FRED-style values). Rates in percent. */
export const mockMacro = {
  y2: { value: 3.58, change: 0.02, date: "2026-11-17" },
  y10: { value: 4.12, change: 0.03, date: "2026-11-17" },
  y30: { value: 4.71, change: 0.04, date: "2026-11-17" },
  spread2s10s: { value: 0.54, change: 0.01, date: "2026-11-17" },
  fedFunds: { value: 3.88, date: "2026-10-01" },
  targetRange: { lower: 3.75, upper: 4.0 },
  cpiYoY: { value: 0.029, date: "2026-10-01" },
  unemployment: { value: 4.3, change: 0.1, date: "2026-10-01" },
  gdp: { level: 31.4, qoqAnnualized: 0.041, date: "2026-07-01" },
};

/**
 * Fallback editorial copy, used only if content/issues/ has no files.
 * Real issues live in content/issues/YYYY-MM-DD.mdx.
 */
export const mockIssue = {
  headline: "Chips lead, consumers lag",
  dek: "Semis carried the tape while two big-box retailers warned on holiday spending. Treasuries sold off modestly ahead of next month's FOMC.",
  editorsTake:
    "The market keeps paying for AI capacity and punishing anything tied to a stretched consumer. That split can run longer than skeptics expect, but watch the 10-year: another leg toward 4.25% would test the multiples doing the heavy lifting.",
  movers: [
    { symbol: "SMCI", note: "Raised full-year guidance after a record server backlog." },
    { symbol: "TGT", note: "Cut holiday comps outlook; flagged heavier promotions." },
    { symbol: "PLTR", note: "Won a multi-year Army data contract extension." },
  ],
  macroCommentary:
    "The curve kept steepening as the long end sold off. Futures still price roughly even odds of a December cut; Friday's payrolls print is the swing factor.",
};

/* ───────────── Mock series for charts (Phase 2) ───────────── */

/**
 * Tiny deterministic random number generator, so mock charts look the
 * same on every render (Math.random would change on each refresh).
 */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Business days (Mon–Fri) going back from `end`, oldest → newest */
function businessDays(count: number, end: Date = new Date("2026-11-18T12:00:00Z")): string[] {
  const out: string[] = [];
  const d = new Date(end);
  while (out.length < count) {
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) out.unshift(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return out;
}

/** Random walk that ends exactly at `last` */
function walk(dates: string[], last: number, vol: number, drift: number, seed: number) {
  const rand = seeded(seed);
  const values = [last];
  for (let i = 1; i < dates.length; i++) {
    const prev = values[0];
    values.unshift(prev - drift - (rand() - 0.5) * vol);
  }
  return dates.map((date, i) => ({ date, value: Number(values[i].toFixed(2)) }));
}

/** ~1 month of S&P 500 closes */
export const mockSpxHistory = walk(businessDays(23), 6912.4, 70, 3, 7);

/** 1 year of the 2s10s spread, in percentage points */
export const mockSpreadHistory = walk(businessDays(252), 0.54, 0.05, 0.0012, 11);

/**
 * Treasury curve: today vs 1 month ago vs 1 year ago (percent).
 * Maturity labels match FRED series DGS1MO … DGS30.
 */
export const mockYieldCurve = [
  { maturity: "1M", today: 3.86, monthAgo: 3.95, yearAgo: 4.62 },
  { maturity: "3M", today: 3.8, monthAgo: 3.9, yearAgo: 4.55 },
  { maturity: "6M", today: 3.71, monthAgo: 3.8, yearAgo: 4.42 },
  { maturity: "1Y", today: 3.62, monthAgo: 3.66, yearAgo: 4.3 },
  { maturity: "2Y", today: 3.58, monthAgo: 3.55, yearAgo: 4.27 },
  { maturity: "3Y", today: 3.62, monthAgo: 3.58, yearAgo: 4.23 },
  { maturity: "5Y", today: 3.74, monthAgo: 3.69, yearAgo: 4.2 },
  { maturity: "7Y", today: 3.92, monthAgo: 3.86, yearAgo: 4.29 },
  { maturity: "10Y", today: 4.12, monthAgo: 4.05, yearAgo: 4.42 },
  { maturity: "20Y", today: 4.63, monthAgo: 4.56, yearAgo: 4.71 },
  { maturity: "30Y", today: 4.71, monthAgo: 4.63, yearAgo: 4.6 },
];

/* ───────────── Mock price history for any symbol (Phase 3) ───────────── */

/** Turn a string into a stable number, so each ticker gets its own (repeatable) mock path */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Business days from `from` to `to` (inclusive), oldest → newest */
function businessDaysBetween(from: string, to: string): string[] {
  const out: string[] = [];
  const d = new Date(`${from}T12:00:00Z`);
  const end = new Date(`${to}T12:00:00Z`);
  while (d <= end) {
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

/**
 * Plausible daily closes for `symbol` between two dates.
 * Give `start` to pin the first price (e.g. price at publication), or
 * `end` to pin the last price (e.g. today's S&P level).
 */
export function mockCloses(
  symbol: string,
  from: string,
  to: string,
  anchor: { start: number } | { end: number } | { date: string; price: number },
): { date: string; value: number }[] {
  const dates = businessDaysBetween(from, to);
  if (dates.length === 0) return [];
  const rand = seeded(hashString(symbol));
  // Each symbol drifts toward its own total return between −12% and +18%
  const isIndex = symbol.startsWith("^");
  const total = isIndex ? 0.03 : -0.12 + rand() * 0.3;
  const dailyVol = isIndex ? 0.008 : 0.018;
  const n = dates.length;
  const path = [1];
  for (let i = 1; i < n; i++) {
    path.push(path[i - 1] * (1 + total / n + (rand() - 0.5) * 2 * dailyVol));
  }
  // Scale the path so it passes exactly through the anchor price on the anchor date
  let idx = n - 1;
  if ("date" in anchor) {
    idx = 0;
    dates.forEach((d, i) => {
      if (d <= anchor.date) idx = i;
    });
  }
  const scale = "start" in anchor ? anchor.start / path[0] : "end" in anchor ? anchor.end / path[n - 1] : anchor.price / path[idx];
  return dates.map((date, i) => ({ date, value: Number((path[i] * scale).toFixed(2)) }));
}
