import { cacheLife } from "next/cache";
import { formatIssueDate } from "@/lib/format";

/*
 * This project uses Next.js "Cache Components" (see next.config.ts),
 * which won't let a page read the clock (`new Date()`) during rendering
 * unless you say how long the result may be reused. `"use cache"` plus
 * `cacheLife("minutes")` means: compute it, reuse it, and refresh it in
 * the background about once a minute. So the date rolls over shortly
 * after midnight ET without making every page fully dynamic.
 */

/** Today's date in New York time, e.g. "Wednesday, November 18, 2026" */
export async function IssueDate() {
  "use cache";
  cacheLife("minutes");
  return <time>{formatIssueDate(new Date())}</time>;
}

/** Current year, for the copyright line */
export async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
