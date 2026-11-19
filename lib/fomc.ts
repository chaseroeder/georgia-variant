/**
 * FOMC meeting dates. There's no free API for these, so they live here.
 * The date listed is the SECOND day of each meeting (when the statement
 * comes out at 2:00 p.m. ET).
 *
 * Source: https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm
 * TODO each year: add the next year's dates once the Fed publishes them.
 */
export const FOMC_DECISION_DATES = [
  "2026-01-28",
  "2026-03-18",
  "2026-04-29",
  "2026-06-17",
  "2026-07-29",
  "2026-09-16",
  "2026-10-28",
  "2026-12-09",
];

/** Next decision date on or after `todayIso` ("YYYY-MM-DD"), or null if the list ran out */
export function nextFomcDate(todayIso: string): string | null {
  return FOMC_DECISION_DATES.find((d) => d >= todayIso) ?? null;
}
