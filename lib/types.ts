/**
 * Shared data shapes. Every data provider (mock, FMP, Alpha Vantage, FRED…)
 * must return these shapes, so the UI never cares where data came from.
 */

/** How a quote should be displayed */
export type QuoteKind = "index" | "yield" | "commodity" | "fx" | "crypto" | "stock" | "volatility";

export interface Quote {
  /** Our internal id, e.g. "SPX" */
  symbol: string;
  /** Human label, e.g. "S&P 500" */
  name: string;
  kind: QuoteKind;
  price: number;
  /** Absolute change since previous close (for yields: percentage points) */
  change: number;
  /** Fractional change, e.g. 0.0042 = +0.42% (ignored for yields) */
  changePct: number;
}

export interface Mover {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
}

export interface SectorPerf {
  symbol: string; // e.g. "XLK"
  name: string; // e.g. "Technology"
  changePct: number;
}

/**
 * Every data call returns its payload plus `isSample`.
 * isSample = true means we fell back to mock data (no API key or the
 * call failed), and the UI shows a small "Sample data" badge.
 */
export interface DataResult<T> {
  data: T;
  isSample: boolean;
  /** ISO timestamp of when the data was fetched/generated */
  asOf: string;
}
