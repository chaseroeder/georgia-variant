import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/ArticleSkeleton";
import { Mdx } from "@/components/Mdx";
import { SampleBadge, SectionTag } from "@/components/ui";
import { getIssue, getIssues } from "@/lib/content";
import { formatIssueDate, formatShortDate } from "@/lib/format";

/**
 * One past issue: /archive/2026-11-18
 *
 * Archived issues show what was written that day. Live market numbers
 * aren't stored (no database in v1), so for today's numbers the page
 * links to Market Pulse and the Macro Desk.
 */

export function generateStaticParams() {
  return getIssues().map((i) => ({ date: i.date }));
}

export async function generateMetadata({ params }: PageProps<"/archive/[date]">): Promise<Metadata> {
  const issue = getIssue((await params).date);
  if (!issue) return {};
  return { title: `${issue.headline} (${formatShortDate(issue.date)})`, description: issue.dek };
}

// The URL-dependent part streams in inside <Suspense> (see variant-view/[slug]/page.tsx)
export default function IssuePage({ params }: PageProps<"/archive/[date]">) {
  return (
    <Suspense fallback={<ArticleSkeleton narrow />}>
      <IssueContent params={params} />
    </Suspense>
  );
}

async function IssueContent({ params }: { params: PageProps<"/archive/[date]">["params"] }) {
  const { date } = await params;
  const issue = getIssue(date);
  if (!issue) notFound();

  // Neighbors for prev/next links (list is newest first)
  const all = getIssues();
  const idx = all.findIndex((i) => i.date === date);
  const newer = all[idx - 1];
  const older = all[idx + 1];
  const isLatest = idx === 0;

  return (
    <article className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
      <Link href="/archive" className="text-sm font-medium text-ink-muted hover:text-ink-strong">
        ← All issues
      </Link>

      <header className="mt-8 border-b border-rule pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
          <time dateTime={issue.date}>{formatIssueDate(new Date(`${issue.date}T12:00:00Z`))}</time>
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <SectionTag>{isLatest ? "Latest issue" : "From the archive"}</SectionTag>
          {issue.draft && <SampleBadge label="Draft (only visible in dev)" />}
          {issue.sample && <SampleBadge label="Sample issue" />}
        </div>
        <h1
          className="mt-4 text-4xl font-semibold leading-[1.05] sm:text-5xl"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {issue.headline}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">{issue.dek}</p>
        <p className="mt-3 text-sm text-ink-muted">By {issue.author}</p>
      </header>

      <Section title="Editor’s take">
        <blockquote className="border-l-2 border-rule-strong pl-5 font-serif text-xl leading-snug text-ink-strong sm:text-2xl">
          {issue.editorsTake}
        </blockquote>
      </Section>

      {issue.movers.length > 0 && (
        <Section title="Notable movers">
          <ul className="divide-y divide-rule">
            {issue.movers.map((m, i) => (
              <li key={`${m.symbol}-${i}`} className="flex gap-4 py-3">
                <span className="num w-14 shrink-0 font-semibold text-ink-strong">{m.symbol}</span>
                <span className="text-ink">{m.note}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Macro">
        <p className="text-lg leading-relaxed text-ink">{issue.macroCommentary}</p>
      </Section>

      {issue.body.trim() && (
        <div className="mt-10 border-t border-rule pt-8">
          <Mdx source={issue.body} />
        </div>
      )}

      {isLatest && (
        <div className="band-alt mt-12 rounded-2xl p-6 text-sm leading-relaxed text-ink">
          Live numbers for this issue are on{" "}
          <Link href="/market-pulse" className="font-semibold text-ink-strong underline underline-offset-4">
            Market Pulse
          </Link>{" "}
          and the{" "}
          <Link href="/macro" className="font-semibold text-ink-strong underline underline-offset-4">
            Macro Desk
          </Link>
          .
        </div>
      )}

      {/* Prev / next */}
      <nav aria-label="More issues" className="mt-12 grid gap-3 border-t border-rule pt-6 sm:grid-cols-2">
        {older ? (
          <Link href={`/archive/${older.date}`} className="group rounded-xl p-3 transition-colors hover:bg-surface-alt">
            <span className="text-xs text-ink-muted">← Older · {formatShortDate(older.date)}</span>
            <span className="mt-1 block font-serif text-lg font-semibold text-ink-strong">{older.headline}</span>
          </Link>
        ) : (
          <span />
        )}
        {newer && (
          <Link href={`/archive/${newer.date}`} className="group rounded-xl p-3 text-right transition-colors hover:bg-surface-alt">
            <span className="text-xs text-ink-muted">Newer · {formatShortDate(newer.date)} →</span>
            <span className="mt-1 block font-serif text-lg font-semibold text-ink-strong">{newer.headline}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
