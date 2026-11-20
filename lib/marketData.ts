/**
 * Market data abstraction.
 *
 * The rest of the app ONLY imports from this file, never from a provider
 * directly. To switch providers (e.g. FMP → Alpha Vantage), write a new
 * file in lib/providers/ and change the imports here; no page changes.
 *
 * Every function returns { data, isSample, asOf }. If the API key is
 * missing or a request fails, we use mock data and set isSample: true,
 * so the page still renders and shows a "Sample data" badge.
 *
 * ── What the FMP free plan covers ──
 * Free: index quotes (^GSPC, ^IXIC, ^DJI, ^RUT, ^VIX), gold, bitcoin,
 * gainers/losers, and daily history for many (not all) stocks.
 * Paid only (HTTP 402): batch quotes, sector ETFs (XLK…), the DXY dollar
 * index, and oil futures. So:
 *   • oil and the dollar come from FRED instead (free, daily closes)
 *   • sector ETFs stay on sample data unless FMP_PAID_PLAN=true
 *
 * ── Staying under 250 FMP calls/day ──
 * One refresh = 7 quote calls + 2 movers calls = 9 calls.
 *   • market open:   every FMP_REFRESH_MINUTES (default 30) → ~13 refreshes
 *   • market closed: every 6 hours                          → ~3 refreshes
 *   • daily price history: every 6 hours
 * That's roughly 150 calls on a busy day. If you ever see HTTP 429
 * (rate limit) in the logs, raise FMP_REFRESH_MINUTES (e.g. 45).
 */
import { cacheLife } from "next/cache";
import { isoDaysAgo } from "./fred";
import { getFredLatest, getTenYear } from "./macroData";
import { isMarketOpen, todayInNewYork } from "./marketHours";
import { mockCloses, mockGainers, mockLosers, mockSectors, mockSpxHistory, mockTicker } from "./mockData";
import { fmpDailyCloses, fmpMovers, fmpQuotes, hasFmpKey, type NormalizedQuote } from "./providers/fmp";
import type { DataResult, Mover, Quote, SectorPerf } from "./types";

/* ───────────── Symbol map ─────────────
 * Our id → the provider's symbol. If one instrument keeps showing sample
 * data while the rest are live, its provider symbol is probably wrong or
 * not on your plan; fix it here.
 */
const TICKER_SYMBOLS: Record<string, string> = {
  SPX: "^GSPC",
  NDX: "^IXIC", // Nasdaq Composite
  DJI: "^DJI",
  RUT: "^RUT",
  VIX: "^VIX",
  GOLD: "GCUSD", // gold futures
  BTC: "BTCUSD",
};

/** Ticker items that come from FRED instead (not on FMP's free plan) */
const FRED_TICKER: Record<string, string> = {
  WTI: "DCOILWTICO", // WTI crude oil spot price, $/barrel
  USD: "DTWEXBGS", // Nominal broad U.S. dollar index
};

const SECTOR_SYMBOLS = mockSectors.map((s) => s.symbol); // XLK, XLC, … (11 SPDR ETFs)

/** Set FMP_PAID_PLAN=true in Vercel if you upgrade FMP: enables sector ETFs and batch quotes */
const paidPlan = process.env.FMP_PAID_PLAN === "true";

/* ───────────── Cache settings ───────────── */

const refreshMinutes = Number(process.env.FMP_REFRESH_MINUTES) || 30;

/** Pick a cache lifetime based on whether the market is open */
function marketCache() {
  if (isMarketOpen()) {
    cacheLife({ stale: 300, revalidate: refreshMinutes * 60, expire: 2 * 3600 });
  } else {
    // Prices aren't moving: refresh every 6 hours to save API calls
    cacheLife({ stale: 1800, revalidate: 6 * 3600, expire: 24 * 3600 });
  }
}

/** Daily closes change once a day, so a few refreshes a day is plenty */
function historyCache() {
  cacheLife({ stale: 3600, revalidate: 6 * 3600, expire: 2 * 24 * 3600 });
}

function result<T>(data: T, isSample: boolean): DataResult<T> {
  return { data, isSample, asOf: new Date().toISOString() };
}

/* ───────────── Internal: one shared quote fetch ───────────── */

// Returns a plain object (not a Map) because cached values must be serializable.
async function getAllQuotes(): Promise<Record<string, NormalizedQuote> | null> {
  "use cache";
  marketCache();
  if (!hasFmpKey()) return null;
  try {
    // Sector ETFs are paid-only on FMP, so only request them on a paid plan
    const symbols = [...Object.values(TICKER_SYMBOLS), ...(paidPlan ? SECTOR_SYMBOLS : [])];
    const map = await fmpQuotes(symbols, { tryBatch: paidPlan });
    return map.size > 0 ? Object.fromEntries(map) : null;
  } catch (err) {
    console.warn("[marketData] quotes failed, using mock:", err);
    return null;
  }
}

/* ───────────── Public functions ───────────── */

/** The 10 instruments in the hero ticker strip (10Y yield comes from FRED) */
export async function getTickerQuotes(): Promise<DataResult<Quote[]>> {
  "use cache";
  marketCache();

  const mockFor = (id: string) => mockTicker.find((m) => m.symbol === id)!;
  const [quotes, tenYear, oil, dollar] = await Promise.all([
    getAllQuotes(),
    getTenYear(),
    getFredLatest(FRED_TICKER.WTI, { value: mockFor("WTI").price, change: mockFor("WTI").change }),
    getFredLatest(FRED_TICKER.USD, { value: mockFor("USD").price, change: mockFor("USD").change }),
  ]);
  let usedMock = tenYear.isSample || oil.isSample || dollar.isSample || !quotes;

  const data = mockTicker.map((mock): Quote => {
    if (mock.symbol === "US10Y") {
      return { ...mock, price: tenYear.data.value, change: tenYear.data.change };
    }
    if (mock.symbol === "WTI" || mock.symbol === "USD") {
      const d = mock.symbol === "WTI" ? oil.data : dollar.data;
      return { ...mock, price: d.value, change: d.change, changePct: d.changePct };
    }
    const live = quotes?.[TICKER_SYMBOLS[mock.symbol]];
    if (!live) {
      usedMock = true;
      return mock; // keep our label and kind, use mock numbers
    }
    return { ...mock, price: live.price, change: live.change, changePct: live.changePct };
  });

  return result(data, usedMock);
}

/** Daily % change for the 11 SPDR sector ETFs, best → worst */
export async function getSectorPerformance(): Promise<DataResult<SectorPerf[]>> {
  "use cache";
  marketCache();

  // Free FMP plan: sector ETFs aren't available, so show sample data (with the badge)
  if (!paidPlan) {
    return result([...mockSectors].sort((a, b) => b.changePct - a.changePct), true);
  }

  const quotes = await getAllQuotes();
  let usedMock = !quotes;
  const data = mockSectors
    .map((mock) => {
      const live = quotes?.[mock.symbol];
      if (!live) usedMock = true;
      return live ? { ...mock, changePct: live.changePct } : mock;
    })
    .sort((a, b) => b.changePct - a.changePct);
  return result(data, usedMock);
}

/**
 * Top 5 gainers and losers. FMP's lists include penny stocks, leveraged
 * ETFs, and blank-check "acquisition" shells, so we keep only regular
 * companies trading at $5 or more with a normal ticker.
 */
const NOT_A_COMPANY = /\b(ETF|ETN|Fund|Trust|2x|3x|Leveraged|Inverse|Daily|Acquisition Corp(oration)?|SPAC)\b/i;
export async function getTopMovers(): Promise<DataResult<{ gainers: Mover[]; losers: Mover[] }>> {
  "use cache";
  marketCache();

  const mock = { gainers: mockGainers, losers: mockLosers };
  if (!hasFmpKey()) return result(mock, true);

  try {
    const [g, l] = await Promise.all([fmpMovers("gainers"), fmpMovers("losers")]);
    const clean = (rows: NormalizedQuote[]) =>
      rows
        .filter((r) => r.price >= 5 && /^[A-Z.]{1,5}$/.test(r.symbol) && !NOT_A_COMPANY.test(r.name))
        .slice(0, 5)
        .map(({ symbol, name, price, changePct }) => ({ symbol, name, price, changePct }));
    const gainers = clean(g);
    const losers = clean(l);
    if (gainers.length === 0 || losers.length === 0) throw new Error("empty movers list");
    return result({ gainers, losers }, false);
  } catch (err) {
    console.warn("[marketData] movers failed, using mock:", err);
    return result(mock, true);
  }
}

/** About one month of S&P 500 daily closes, for the Market Pulse chart */
export async function getSpxHistory(): Promise<DataResult<{ date: string; value: number }[]>> {
  "use cache";
  historyCache(); // daily closes only change once a day

  if (!hasFmpKey()) return result(mockSpxHistory, true);
  try {
    const rows = await fmpDailyCloses(TICKER_SYMBOLS.SPX, isoDaysAgo(35));
    if (rows.length < 5) throw new Error("too few rows");
    return result(rows, false);
  } catch (err) {
    console.warn("[marketData] S&P history failed, using mock:", err);
    return result(mockSpxHistory, true);
  }
}

/**
 * Daily closes for any stock (or "SPX" for the S&P 500) since `from`.
 * Used by the Variant View scorecard.
 *
 * `mockAnchor` pins the mock price on one date when we have to fall back
 * (we pass the pick's publish date and price, so mock returns line up).
 */
export async function getDailyCloses(
  symbol: string,
  from: string,
  mockAnchor?: { date: string; price: number },
): Promise<DataResult<{ date: string; value: number }[]>> {
  "use cache";
  historyCache();

  const providerSymbol = TICKER_SYMBOLS[symbol] ?? symbol;
  const today = todayInNewYork();
  const mock = () =>
    mockCloses(
      providerSymbol,
      from,
      today,
      symbol === "SPX" ? { end: mockTicker[0].price } : (mockAnchor ?? { start: 100 }),
    );

  if (!hasFmpKey()) return result(mock(), true);
  try {
    const rows = await fmpDailyCloses(providerSymbol, from);
    if (rows.length === 0) throw new Error("no rows");
    return result(rows, false);
  } catch (err) {
    console.warn(`[marketData] closes for ${symbol} failed, using mock:`, err);
    return result(mock(), true);
  }
}
