/**
 * FRED API client (Federal Reserve Bank of St. Louis). Free; get a key at
 * https://fred.stlouisfed.org/docs/api/api_key.html and put it in
 * .env.local as FRED_API_KEY.
 *
 * Docs: https://fred.stlouisfed.org/docs/api/fred/series_observations.html
 */

export interface Observation {
  date: string; // "YYYY-MM-DD"
  value: number;
}

const BASE = "https://api.stlouisfed.org/fred/series/observations";

export function hasFredKey(): boolean {
  return Boolean(process.env.FRED_API_KEY);
}

/**
 * Fetch observations for one series, oldest → newest.
 * FRED marks missing days (holidays) with "." and we skip those.
 * Throws on any error, so callers can fall back to mock data.
 */
export async function fetchFredSeries(
  seriesId: string,
  opts: { start?: string; limit?: number } = {},
): Promise<Observation[]> {
  const key = process.env.FRED_API_KEY;
  if (!key) throw new Error("FRED_API_KEY is not set");

  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: key,
    file_type: "json",
    sort_order: "desc", // newest first, so `limit` keeps the most recent
  });
  if (opts.start) params.set("observation_start", opts.start);
  if (opts.limit) params.set("limit", String(opts.limit));

  const res = await fetch(`${BASE}?${params}`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`FRED ${seriesId}: HTTP ${res.status}`);

  const json = (await res.json()) as { observations?: { date: string; value: string }[] };
  const obs = (json.observations ?? [])
    .filter((o) => o.value !== ".")
    .map((o) => ({ date: o.date, value: Number(o.value) }))
    .filter((o) => Number.isFinite(o.value))
    .reverse(); // back to oldest → newest

  if (obs.length === 0) throw new Error(`FRED ${seriesId}: no data`);
  return obs;
}

/** Last observation on or before `date` (series must be oldest → newest) */
export function valueOnOrBefore(series: Observation[], date: string): Observation | undefined {
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i].date <= date) return series[i];
  }
  return undefined;
}

/** "YYYY-MM-DD" for `days` days before `from` */
export function isoDaysAgo(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}
