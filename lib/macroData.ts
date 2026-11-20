/**
 * Macro & bond data, from FRED.
 *
 * Like lib/marketData.ts, every function returns { data, isSample, asOf }
 * and falls back to mock data if FRED_API_KEY is missing or a call fails.
 *
 * FRED publishes these once a day at most (CPI/jobs monthly, GDP
 * quarterly), so we cache for hours, not minutes.
 */
import { cacheLife } from "next/cache";
import { fetchFredSeries, hasFredKey, isoDaysAgo, valueOnOrBefore, type Observation } from "./fred";
import { nextFomcDate } from "./fomc";
import { todayInNewYork } from "./marketHours";
import { mockMacro, mockSpreadHistory, mockYieldCurve } from "./mockData";
import type { DataResult } from "./types";

/* ───────────── Types ───────────── */

export interface RatePoint {
  value: number; // percent, e.g. 4.12
  change: number; // vs previous observation, percentage points
  date: string;
}

export interface MacroSnapshot {
  y2: RatePoint;
  y10: RatePoint;
  y30: RatePoint;
  spread2s10s: RatePoint;
  fedFunds: { value: number; date: string };
  targetRange: { lower: number; upper: number } | null;
  cpiYoY: { value: number; date: string }; // fraction, 0.029 = 2.9%
  unemployment: { value: number; change: number; date: string };
  gdp: { level: number; qoqAnnualized: number; date: string }; // level in $ trillions
  nextFomc: string | null;
  /** Days from today (New York) until nextFomc; 0 = today */
  nextFomcInDays: number | null;
}

export interface CurvePoint {
  maturity: string;
  today: number;
  monthAgo: number;
  yearAgo: number;
}

/* ───────────── Helpers ───────────── */

function result<T>(data: T, isSample: boolean): DataResult<T> {
  return { data, isSample, asOf: new Date().toISOString() };
}

/** Latest value + change vs the previous observation */
function ratePoint(obs: Observation[]): RatePoint {
  const last = obs[obs.length - 1];
  const prev = obs[obs.length - 2] ?? last;
  return { value: last.value, change: Number((last.value - prev.value).toFixed(3)), date: last.date };
}

/* ───────────── Public functions ───────────── */

/** Everything on the Macro Desk except the charts */
export async function getMacroSnapshot(): Promise<DataResult<MacroSnapshot>> {
  "use cache";
  cacheLife("hours");

  const today = todayInNewYork();
  const nextFomc = nextFomcDate(today);
  const nextFomcInDays = nextFomc ? Math.round((Date.parse(nextFomc) - Date.parse(today)) / 86_400_000) : null;
  if (!hasFredKey()) return result({ ...mockMacro, nextFomc, nextFomcInDays }, true);

  // Fire all requests at once. allSettled = one failure doesn't sink the rest.
  const ids = ["DGS2", "DGS10", "DGS30", "T10Y2Y", "FEDFUNDS", "DFEDTARL", "DFEDTARU", "CPIAUCSL", "UNRATE", "GDP"];
  const limits: Record<string, number> = { CPIAUCSL: 13, FEDFUNDS: 1, DFEDTARL: 1, DFEDTARU: 1 };
  const settled = await Promise.allSettled(ids.map((id) => fetchFredSeries(id, { limit: limits[id] ?? 2 })));
  const series: Record<string, Observation[] | undefined> = {};
  ids.forEach((id, i) => {
    const s = settled[i];
    if (s.status === "fulfilled") series[id] = s.value;
    else console.warn(`[macroData] ${id} failed, using mock:`, s.reason);
  });

  let usedMock = false;
  /** Use real data if we got it, otherwise the mock value (and remember that we did) */
  function pick<T>(id: string | string[], build: (...s: Observation[][]) => T, fallback: T): T {
    const list = (Array.isArray(id) ? id : [id]).map((x) => series[x]);
    if (list.every(Boolean)) {
      try {
        return build(...(list as Observation[][]));
      } catch {
        /* fall through to mock */
      }
    }
    usedMock = true;
    return fallback;
  }

  const data: MacroSnapshot = {
    y2: pick("DGS2", ratePoint, mockMacro.y2),
    y10: pick("DGS10", ratePoint, mockMacro.y10),
    y30: pick("DGS30", ratePoint, mockMacro.y30),
    spread2s10s: pick("T10Y2Y", ratePoint, mockMacro.spread2s10s),
    fedFunds: pick("FEDFUNDS", (s) => ({ value: s.at(-1)!.value, date: s.at(-1)!.date }), mockMacro.fedFunds),
    targetRange: pick(
      ["DFEDTARL", "DFEDTARU"],
      (lo, hi) => ({ lower: lo.at(-1)!.value, upper: hi.at(-1)!.value }),
      mockMacro.targetRange,
    ),
    // CPI is an index level; inflation = this month vs the same month last year
    cpiYoY: pick(
      "CPIAUCSL",
      (s) => {
        if (s.length < 13) throw new Error("need 13 months");
        return { value: s.at(-1)!.value / s.at(-13)!.value - 1, date: s.at(-1)!.date };
      },
      mockMacro.cpiYoY,
    ),
    unemployment: pick("UNRATE", (s) => {
      const p = ratePoint(s);
      return { value: p.value, change: p.change, date: p.date };
    }, mockMacro.unemployment),
    // GDP is nominal, in billions (annualized). Growth = quarter-over-quarter, annualized.
    gdp: pick(
      "GDP",
      (s) => {
        const [prev, last] = s.slice(-2);
        return {
          level: last.value / 1000,
          qoqAnnualized: Math.pow(last.value / prev.value, 4) - 1,
          date: last.date,
        };
      },
      mockMacro.gdp,
    ),
    nextFomc,
    nextFomcInDays,
  };

  return result(data, usedMock);
}

/** Treasury curve today vs ~1 month ago vs ~1 year ago */
const CURVE_SERIES: [string, string][] = [
  ["1M", "DGS1MO"],
  ["3M", "DGS3MO"],
  ["6M", "DGS6MO"],
  ["1Y", "DGS1"],
  ["2Y", "DGS2"],
  ["3Y", "DGS3"],
  ["5Y", "DGS5"],
  ["7Y", "DGS7"],
  ["10Y", "DGS10"],
  ["20Y", "DGS20"],
  ["30Y", "DGS30"],
];

export async function getYieldCurve(): Promise<DataResult<{ points: CurvePoint[]; asOfDate: string }>> {
  "use cache";
  cacheLife("hours");

  if (!hasFredKey()) return result({ points: mockYieldCurve, asOfDate: "2026-11-17" }, true);

  try {
    const start = isoDaysAgo(380);
    const all = await Promise.all(CURVE_SERIES.map(([, id]) => fetchFredSeries(id, { start })));
    // Anchor "today" to the most recent date across the curve
    const latest = all.map((s) => s.at(-1)!.date).sort().at(-1)!;
    const monthAgo = isoDaysAgo(30, new Date(`${latest}T12:00:00Z`));
    const yearAgo = isoDaysAgo(365, new Date(`${latest}T12:00:00Z`));

    const points = CURVE_SERIES.map(([maturity], i) => {
      const s = all[i];
      const t = valueOnOrBefore(s, latest);
      const m = valueOnOrBefore(s, monthAgo);
      const y = valueOnOrBefore(s, yearAgo);
      if (!t || !m || !y) throw new Error(`curve gap at ${maturity}`);
      return { maturity, today: t.value, monthAgo: m.value, yearAgo: y.value };
    });
    return result({ points, asOfDate: latest }, false);
  } catch (err) {
    console.warn("[macroData] yield curve failed, using mock:", err);
    return result({ points: mockYieldCurve, asOfDate: "2026-11-17" }, true);
  }
}

/** One year of the 2s10s spread (10Y minus 2Y, percentage points) */
export async function getSpreadHistory(): Promise<DataResult<Observation[]>> {
  "use cache";
  cacheLife("hours");

  if (!hasFredKey()) return result(mockSpreadHistory, true);
  try {
    return result(await fetchFredSeries("T10Y2Y", { start: isoDaysAgo(365) }), false);
  } catch (err) {
    console.warn("[macroData] T10Y2Y history failed, using mock:", err);
    return result(mockSpreadHistory, true);
  }
}

/** Latest 10-year yield, for the hero ticker */
export async function getTenYear(): Promise<DataResult<RatePoint>> {
  "use cache";
  cacheLife("hours");

  if (!hasFredKey()) return result(mockMacro.y10, true);
  try {
    return result(ratePoint(await fetchFredSeries("DGS10", { limit: 2 })), false);
  } catch {
    return result(mockMacro.y10, true);
  }
}

/**
 * Latest daily value + change for any FRED series, for ticker items that
 * Financial Modeling Prep's free plan doesn't include (oil, the dollar).
 * These FRED series are daily closes published with a short delay.
 */
export async function getFredLatest(
  seriesId: string,
  mock: { value: number; change: number },
): Promise<DataResult<{ value: number; change: number; changePct: number; date: string }>> {
  "use cache";
  cacheLife("hours");

  const fallback = { ...mock, changePct: mock.change / (mock.value - mock.change), date: "" };
  if (!hasFredKey()) return result(fallback, true);
  try {
    const obs = await fetchFredSeries(seriesId, { limit: 10 });
    const last = obs.at(-1)!;
    const prev = obs.at(-2) ?? last;
    return result(
      { value: last.value, change: last.value - prev.value, changePct: prev.value ? last.value / prev.value - 1 : 0, date: last.date },
      false,
    );
  } catch (err) {
    console.warn(`[macroData] ${seriesId} failed, using mock:`, err);
    return result(fallback, true);
  }
}
