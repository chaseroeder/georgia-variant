/**
 * Number and date formatting helpers.
 * Keeping these in one place means every price on the site looks the same.
 */

/** 6912.4 -> "6,912.40" */
export function formatPrice(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** 0.0123 -> "+1.23%" (input is a fraction, not a percent) */
export function formatPct(fraction: number, decimals = 2): string {
  const pct = fraction * 100;
  const sign = pct > 0 ? "+" : pct < 0 ? "−" : ""; // real minus sign, not a hyphen
  return `${sign}${Math.abs(pct).toFixed(decimals)}%`;
}

/** Signed absolute change: 12.3 -> "+12.30" */
export function formatChange(value: number, decimals = 2): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatPrice(Math.abs(value), decimals)}`;
}

/** Basis-point change for yields: 0.034 (percentage points) -> "+3 bp" */
export function formatBp(pctPoints: number): string {
  const bp = Math.round(pctPoints * 100);
  const sign = bp > 0 ? "+" : bp < 0 ? "−" : "";
  return `${sign}${Math.abs(bp)} bp`;
}

/** "Wednesday, November 18, 2026", always in New York time (market time) */
export function formatIssueDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

/** Short date: "Nov 18, 2026" */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(`${date}T12:00:00Z`) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}

/** -1 / 0 / 1, handy for picking gain vs loss colors */
export function direction(n: number): -1 | 0 | 1 {
  return n > 0 ? 1 : n < 0 ? -1 : 0;
}
