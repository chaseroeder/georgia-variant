"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar } from "./Avatar";
import { SampleBadge } from "./ui";

/**
 * Searchable, filterable alumni directory.
 *
 * This is a Client Component because search and filtering happen live as
 * you type. The server passes in the list of alumni (just the summary
 * fields, not full articles), so the page still loads fast.
 */
export interface AlumnusSummary {
  slug: string;
  name: string;
  classYear: number;
  school: string;
  role: string;
  firm: string;
  industry: string;
  location?: string;
  photo?: string;
  headline: string;
  placeholder: boolean;
}

export function FoundersDirectory({ alumni, industries }: { alumni: AlumnusSummary[]; industries: readonly string[] }) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return alumni.filter((a) => {
      if (industry && a.industry !== industry) return false;
      if (!q) return true;
      return [a.name, a.firm, a.role, a.school, a.headline, a.location ?? "", String(a.classYear)]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [alumni, query, industry]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    alumni.forEach((a) => (c[a.industry] = (c[a.industry] ?? 0) + 1));
    return c;
  }, [alumni]);

  return (
    <div>
      {/* Search + filters, all in one block above the results */}
      <div className="flex flex-col gap-4">
        <label className="relative block">
          <span className="sr-only">Search alumni</span>
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
            placeholder="Search by name, firm, role, or class year"
            className="w-full rounded-full border border-rule bg-surface py-3 pl-11 pr-4 text-base text-ink shadow-card outline-none transition-colors placeholder:text-ink-muted focus:border-navy dark:focus:border-light-blue"
          />
        </label>

        <div role="group" aria-label="Filter by industry" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          <FilterChip active={industry === null} onClick={() => setIndustry(null)} label="All" count={alumni.length} />
          {industries.map((ind) => (
            <FilterChip
              key={ind}
              active={industry === ind}
              onClick={() => setIndustry(industry === ind ? null : ind)}
              label={ind}
              count={counts[ind] ?? 0}
            />
          ))}
        </div>
      </div>

      <p aria-live="polite" className="mt-6 text-sm text-ink-muted">
        {results.length === alumni.length ? `${alumni.length} profiles` : `${results.length} of ${alumni.length} profiles`}
      </p>

      {results.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-rule p-10 text-center">
          <p className="font-serif text-xl text-ink-strong">No alumni match that search.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIndustry(null);
            }}
            className="mt-3 text-sm font-semibold text-ink-strong underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/founders/${a.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-rule bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-card-hover dark:hover:border-light-blue/40"
              >
                <div className="flex items-center gap-4">
                  <Avatar name={a.name} photo={a.photo} size={52} />
                  <div className="min-w-0">
                    <div className="truncate font-serif text-lg font-semibold text-ink-strong">{a.name}</div>
                    <div className="truncate text-sm text-ink-muted">
                      {a.role}, {a.firm}
                    </div>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-[15px] leading-snug text-ink">{a.headline}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-tag px-2 py-0.5 font-semibold text-tag-ink">{a.industry}</span>
                  <span className="num text-ink-muted">
                    {shortSchool(a.school)} ’{String(a.classYear).slice(-2)}
                  </span>
                  {a.placeholder && <SampleBadge label="Template" />}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-navy bg-navy text-white dark:border-light-blue dark:bg-light-blue dark:text-navy"
          : "border-rule bg-surface text-ink hover:border-navy/40 dark:hover:border-light-blue/40"
      }`}
    >
      {label}
      <span className={`num text-xs ${active ? "opacity-80" : "text-ink-muted"}`}>{count}</span>
    </button>
  );
}

/** "Goizueta Business School" → "Goizueta", "Emory College of Arts and Sciences" → "Emory College" */
function shortSchool(school: string): string {
  if (/goizueta/i.test(school)) return "Goizueta";
  if (/emory college/i.test(school)) return "Emory College";
  if (/oxford/i.test(school)) return "Oxford College";
  if (/law/i.test(school)) return "Emory Law";
  return school;
}
