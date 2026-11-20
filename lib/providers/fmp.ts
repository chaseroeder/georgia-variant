/**
 * Financial Modeling Prep (FMP) provider.
 * Docs: https://site.financialmodelingprep.com/developer/docs
 *
 * Why FMP over Alpha Vantage: FMP's free plan allows 250 calls/day,
 * while Alpha Vantage's free plan allows 25/day. 25 isn't enough to
 * refresh 20+ quotes even once an hour. FMP also has ready-made
 * "biggest gainers / losers" endpoints.
 *
 * Only lib/marketData.ts should import this file.
 * Every function throws on failure; marketData.ts catches and falls back.
 */

const BASE = "https://financialmodelingprep.com/stable";

/** The key with stray spaces, line breaks, or quotes removed (common when pasting) */
function fmpKey(): string {
  return (process.env.FMP_API_KEY ?? "").trim().replace(/^["']|["']$/g, "");
}

export function hasFmpKey(): boolean {
  return Boolean(fmpKey());
}

async function fmpGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = fmpKey();
  if (!key) throw new Error("FMP_API_KEY is not set");
  const qs = new URLSearchParams({ ...params, apikey: key });
  const res = await fetch(`${BASE}/${path}?${qs}`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    // FMP explains errors in JSON ({ "Error Message": "..." }); include the reason (never the key)
    const reason = await res
      .json()
      .then((j: Record<string, unknown>) => String(j["Error Message"] ?? j["message"] ?? ""))
      .catch(() => "");
    throw new Error(`FMP ${path}: HTTP ${res.status}${reason ? ` (${reason.slice(0, 120)})` : ""}`);
  }
  const json = await res.json();
  // FMP sometimes returns 200 with an error message instead of data
  if (!Array.isArray(json)) throw new Error(`FMP ${path}: ${JSON.stringify(json).slice(0, 200)}`);
  return json as T;
}

/** Raw quote. Field names differ slightly between FMP API versions, so we accept both. */
interface FmpQuote {
  symbol: string;
  name?: string;
  price: number;
  change?: number;
  changePercentage?: number; // stable API, in percent (0.42 = 0.42%)
  changesPercentage?: number; // older API
}

export interface NormalizedQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number; // fraction
}

function normalize(q: FmpQuote): NormalizedQuote {
  const pct = q.changePercentage ?? q.changesPercentage ?? 0;
  return {
    symbol: q.symbol,
    name: q.name ?? q.symbol,
    price: Number(q.price),
    change: Number(q.change ?? 0),
    changePct: Number(pct) / 100,
  };
}

// If the batch endpoint is blocked on the free plan, remember that and
// stop trying it (saves one wasted call per refresh).
let batchUnsupported = false;

/**
 * Quotes for many symbols. Tries ONE batch request first (1 API call);
 * if the plan doesn't allow it, falls back to one request per symbol.
 * Symbols that fail individually are simply missing from the result.
 */
export async function fmpQuotes(
  symbols: string[],
  opts: { tryBatch?: boolean } = {},
): Promise<Map<string, NormalizedQuote>> {
  const out = new Map<string, NormalizedQuote>();

  // Batch quotes are a paid FMP feature; only try them when told the plan supports it
  if (opts.tryBatch && !batchUnsupported) {
    try {
      const rows = await fmpGet<FmpQuote[]>("batch-quote", { symbols: symbols.join(",") });
      rows.forEach((r) => out.set(r.symbol, normalize(r)));
      if (out.size > 0) return out;
    } catch (err) {
      batchUnsupported = true;
      console.warn("[fmp] batch-quote unavailable, falling back to single quotes:", String(err));
    }
  }

  const settled = await Promise.allSettled(
    symbols.map((s) => fmpGet<FmpQuote[]>("quote", { symbol: s })),
  );
  settled.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value[0]) out.set(symbols[i], normalize(r.value[0]));
    else if (r.status === "rejected") console.warn(`[fmp] quote ${symbols[i]} failed:`, String(r.reason));
  });
  return out;
}

/** Today's biggest gainers or losers (all U.S. listings; we filter in marketData.ts) */
export async function fmpMovers(kind: "gainers" | "losers"): Promise<NormalizedQuote[]> {
  const rows = await fmpGet<FmpQuote[]>(kind === "gainers" ? "biggest-gainers" : "biggest-losers", {});
  return rows.map(normalize);
}

/** Daily closes since `from` ("YYYY-MM-DD"), oldest → newest */
export async function fmpDailyCloses(symbol: string, from: string): Promise<{ date: string; value: number }[]> {
  const rows = await fmpGet<{ date: string; price?: number; close?: number }[]>("historical-price-eod/light", {
    symbol,
    from,
  });
  return rows
    .map((r) => ({ date: r.date.slice(0, 10), value: Number(r.price ?? r.close) }))
    .filter((r) => Number.isFinite(r.value))
    .sort((a, b) => a.date.localeCompare(b.date));
}
