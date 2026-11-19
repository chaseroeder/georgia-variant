/**
 * Is the U.S. stock market open right now? (9:30 a.m. to 4:00 p.m. ET,
 * Monday to Friday. Ignores exchange holidays, which is fine for deciding
 * how often to refresh data.)
 */
export function isMarketOpen(now: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));
  const isWeekday = !["Sat", "Sun"].includes(weekday);
  return isWeekday && minutes >= 9 * 60 + 30 && minutes < 16 * 60;
}

/** Today's date in New York as "YYYY-MM-DD" */
export function todayInNewYork(now: Date = new Date()): string {
  // en-CA formats dates as YYYY-MM-DD
  return now.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

/** Current hour (0–23) and weekday ("Mon"…"Sun") in New York */
export function newYorkClock(now: Date = new Date()): { hour: number; weekday: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  return {
    hour: Number(parts.find((p) => p.type === "hour")?.value),
    weekday: parts.find((p) => p.type === "weekday")?.value ?? "",
  };
}
