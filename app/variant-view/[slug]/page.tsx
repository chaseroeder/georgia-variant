import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/ArticleSkeleton";
import { ReturnsChart } from "@/components/charts";
import { TrendChart } from "@/components/charts";
import { Mdx } from "@/components/Mdx";
import { Card, Change, SampleBadge, SectionTag } from "@/components/ui";
import { getVariantPick, getVariantPicks } from "@/lib/content";
import { formatPrice, formatShortDate } from "@/lib/format";
import { getPickPerformance } from "@/lib/performance";

/**
 * One Variant View pick: /variant-view/2026-11-16-DG
 * The slug is the file name in content/variant-view/.
 */

// Prerender a page for every pick at build time
export function generateStaticParams() {
  return getVariantPicks().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/variant-view/[slug]">): Promise<Metadata> {
  const pick = getVariantPick((await params).slug);
  if (!pick) return {};
  return { title: `${pick.company} (${pick.ticker}): Variant View`, description: pick.headline };
}

/*
 * The page itself renders instantly; the part that depends on the URL
 * (which pick?) streams in inside <Suspense>. Next.js 16 asks for this so
 * links can show the page shell immediately while the content loads.
 */
export default function VariantPickPage({ params }: PageProps<"/variant-view/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <PickContent params={params} />
    </Suspense>
  );
}

async function PickContent({ params }: { params: PageProps<"/variant-view/[slug]">["params"] }) {
  const pick = getVariantPick((await params).slug);
  if (!pick) notFound();
  const perf = await getPickPerformance(pick);

  return (
    <article className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <Link href="/variant-view" className="text-sm font-medium text-ink-muted hover:text-ink-strong">
        ← All picks &amp; scorecard
      </Link>

      {/* Header */}
      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <SectionTag>Variant View · {pick.stance}</SectionTag>
          {pick.sample && <SampleBadge label="Sample pick" />}
          {perf.isSample && <SampleBadge />}
        </div>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="text-4xl font-semibold sm:text-5xl" style={{ fontVariationSettings: '"opsz" 144' }}>
            {pick.company}
          </h1>
          <span className="num rounded-md border border-rule px-2 py-0.5 text-sm font-semibold text-ink-muted">
            {pick.ticker}
          </span>
        </div>
        <p className="mt-4 max-w-3xl font-serif text-xl leading-snug text-ink sm:text-2xl">{pick.headline}</p>
        <p className="mt-3 text-sm text-ink-muted">
          {pick.author} · Published {formatShortDate(pick.published)}
        </p>
      </header>

      {/* Key numbers */}
      <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KeyStat label="Price at publication" value={`$${formatPrice(pick.priceAtPublication)}`} />
        <KeyStat label={`Last close (${formatShortDate(perf.asOfDate).replace(/, \d{4}$/, "")})`} value={`$${formatPrice(perf.current)}`} />
        <KeyStat label="Our return" value={<Change value={perf.pickReturn} />} />
        <KeyStat label="vs S&P 500" value={<Change value={perf.excess} />} hint={`S&P ${perf.spxReturn >= 0 ? "+" : "−"}${Math.abs(perf.spxReturn * 100).toFixed(2)}%`} />
      </dl>

      {/* Consensus vs our view */}
      <div className="mt-10 grid gap-3 md:grid-cols-2">
        <Card className="band-alt">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Consensus view</h2>
          <p className="mt-3 text-lg leading-relaxed text-ink">{pick.consensus}</p>
        </Card>
        <Card className="border-navy/40 dark:border-light-blue/40">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-strong">Our variant view</h2>
          <p className="mt-3 text-lg leading-relaxed text-ink-strong">{pick.variantView}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">{pick.ticker} price</h2>
          <p className="mt-1 text-sm text-ink-muted">Dashed lines mark the publish date and price.</p>
          <div className="mt-4">
            <TrendChart
              data={perf.prices}
              valueFormat="price2"
              baseline={pick.priceAtPublication}
              markerDate={perf.prices.find((p) => p.date >= pick.published)?.date}
              markerLabel="Published"
              label={`${pick.company} daily closing price, from six weeks before publication to now.`}
            />
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Since publication vs the S&amp;P 500</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {pick.stance === "Short" ? "Short pick: our return rises when the stock falls." : "Cumulative return from the publish date."}
          </p>
          <div className="mt-4">
            <ReturnsChart data={perf.series} ticker={pick.ticker} />
          </div>
        </Card>
      </div>

      {/* Thesis, catalysts, risks */}
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="text-2xl font-semibold">Key thesis points</h2>
          <ol className="mt-4 space-y-3">
            {pick.thesis.map((t, i) => (
              <li key={i} className="flex gap-4">
                <span className="num flex size-7 shrink-0 items-center justify-center rounded-full bg-tag text-sm font-semibold text-tag-ink">
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed text-ink">{t}</span>
              </li>
            ))}
          </ol>

          <div className="mt-10 border-t border-rule pt-8">
            <Mdx source={pick.body} />
          </div>
        </section>

        <aside className="space-y-3">
          <Card>
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Catalysts</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink marker:text-ink-muted">
              {pick.catalysts.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Risks / what would prove us wrong
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink marker:text-ink-muted">
              {pick.risks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </Card>
          <p className="px-1 text-xs leading-relaxed text-ink-muted">
            Student research for educational purposes. Not investment advice. Authors may hold positions.
          </p>
        </aside>
      </div>
    </article>
  );
}

function KeyStat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-rule bg-surface p-4 shadow-card sm:p-5">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{label}</dt>
      <dd className="num mt-2 text-2xl font-semibold text-ink-strong">{value}</dd>
      {hint && <dd className="num mt-1 text-xs text-ink-muted">{hint}</dd>}
    </div>
  );
}
