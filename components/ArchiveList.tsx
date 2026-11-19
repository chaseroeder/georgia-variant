"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SampleBadge } from "./ui";

/**
 * Searchable list of past issues, grouped by month.
 * Search looks at the headline, summary, editor's take, commentary,
 * tickers, and the date (try "TGT", "Fed", or "November").
 */
export interface IssueSummary {
  date: string;
  headline: string;
  dek: string;
  tickers: string[];
  /** Extra text that's searchable but not shown in the list */
  searchText: string;
  draft: boolean;
  sample: boolean;
}

function parseDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`);
}
function monthLabel(iso: string) {
  return parseDate(iso).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}
function dayLabel(iso: string) {
  return parseDate(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

export function ArchiveList({ issues }: { issues: IssueSummary[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return issues;
    const words = q.split(/\s+/);
    return issues.filter((i) => {
      const hay = [i.headline, i.dek, i.tickers.join(" "), i.searchText, i.date, monthLabel(i.date), dayLabel(i.date)]
        .join(" ")
        .toLowerCase();
      return words.every((w) => hay.includes(w)); // every word must match
    });
  }, [issues, query]);

  // Group by month, keeping newest first
  const groups = useMemo(() => {
    const map = new Map<string, IssueSummary[]>();
    filtered.forEach((i) => {
      const key = monthLabel(i.date);
      map.set(key, [...(map.get(key) ?? []), i]);
    });
    return [...map.entries()];
  }, [filtered]);

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search past issues</span>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by topic, ticker, or date"
          className="w-full rounded-full border border-rule bg-surface py-3 pl-11 pr-4 text-base text-ink shadow-card outline-none transition-colors placeholder:text-ink-muted focus:border-navy dark:focus:border-light-blue"
        />
      </label>

      <p aria-live="polite" className="mt-6 text-sm text-ink-muted">
        {query ? `${filtered.length} of ${issues.length} issues` : `${issues.length} issues`}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-rule p-10 text-center">
          <p className="font-serif text-xl text-ink-strong">No issues match &ldquo;{query}&rdquo;.</p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-3 text-sm font-semibold text-ink-strong underline underline-offset-4"
          >
            Clear search
          </button>
        </div>
      ) : (
        groups.map(([month, list]) => (
          <section key={month} className="mt-8" aria-label={month}>
            <h2 className="border-b border-rule pb-2 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
              {month}
            </h2>
            <ul className="divide-y divide-rule">
              {list.map((i) => (
                <li key={i.date}>
                  <Link
                    href={`/archive/${i.date}`}
                    className="group grid gap-1 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6"
                  >
                    <span className="num pt-1 text-sm text-ink-muted">{dayLabel(i.date)}</span>
                    <span>
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-serif text-xl font-semibold text-ink-strong group-hover:underline group-hover:decoration-light-blue group-hover:decoration-2 group-hover:underline-offset-4">
                          {i.headline}
                        </span>
                        {i.draft && <SampleBadge label="Draft" />}
                        {i.sample && <SampleBadge label="Sample" />}
                      </span>
                      <span className="mt-1 block text-[15px] leading-relaxed text-ink-muted">{i.dek}</span>
                      {i.tickers.length > 0 && (
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {i.tickers.map((t, n) => (
                            <span key={`${t}-${n}`} className="num rounded-md border border-rule px-1.5 py-0.5 text-[11px] font-semibold text-ink-muted">
                              {t}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
