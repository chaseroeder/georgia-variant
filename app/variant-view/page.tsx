import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageSection } from "@/components/PageHeader";
import { Card, CardCta, Change, SampleBadge, SectionTag } from "@/components/ui";
import { getVariantPicks } from "@/lib/content";
import { formatPct, formatPrice, formatShortDate } from "@/lib/format";
import { getPickPerformance } from "@/lib/performance";

export const metadata: Metadata = {
  title: "Variant View",
  description: "One stock a week where we disagree with consensus, and a scorecard of every pick versus the S&P 500.",
};

/**
 * Variant View home + archive: the latest pick, then a scorecard of every
 * pick's return since publication vs the S&P 500 over the same period.
 */
export default async function VariantViewPage() {
  const picks = getVariantPicks();
  const rows = await Promise.all(picks.map(async (pick) => ({ pick, perf: await getPickPerformance(pick) })));
  const anySample = rows.some((r) => r.perf.isSample);

  const latest = rows[0];
  const beat = rows.filter((r) => r.perf.excess > 0).length;
  const avgExcess = rows.length ? rows.reduce((s, r) => s + r.perf.excess, 0) / rows.length : 0;

  return (
    <>
      <PageHeader
        tag="Variant View · Weekly"
        title="Where we disagree with the Street"
        dek="Each week we pick one stock where we think consensus is wrong, lay out why, and say what would prove us wrong. Then we keep score."
        isSample={anySample}
      />

      {latest && (
        <PageSection title="This week's pick">
          <Card href={`/variant-view/${latest.pick.slug}`} className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <SectionTag>{latest.pick.stance}</SectionTag>
                {latest.pick.sample && <SampleBadge label="Sample pick" />}
                <span className="text-xs text-ink-muted">{formatShortDate(latest.pick.published)}</span>
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <h3 className="text-3xl font-semibold">{latest.pick.company}</h3>
                <span className="num rounded-md border border-rule px-1.5 py-0.5 text-xs font-semibold text-ink-muted">
                  {latest.pick.ticker}
                </span>
              </div>
              <p className="mt-3 max-w-2xl font-serif text-xl leading-snug text-ink">{latest.pick.headline}</p>
              <CardCta>Read the thesis</CardCta>
            </div>
            <dl className="grid grid-cols-2 gap-6 md:text-right">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Since pick</dt>
                <dd className="mt-1 text-2xl">
                  <Change value={latest.perf.pickReturn} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">vs S&amp;P</dt>
                <dd className="mt-1 text-2xl">
                  <Change value={latest.perf.excess} />
                </dd>
              </div>
            </dl>
          </Card>
        </PageSection>
      )}

      <PageSection
        id="scorecard"
        title="Scorecard"
        aside={rows.length ? `${beat} of ${rows.length} picks beating the S&P · avg ${formatPct(avgExcess)} vs index` : undefined}
      >
        {rows.length === 0 ? (
          <p className="text-ink-muted">No picks yet. Add one in content/variant-view/.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-rule bg-surface shadow-card">
            <table className="num w-full min-w-[640px] text-sm">
              <caption className="sr-only">
                Every Variant View pick with its return since publication compared with the S&amp;P 500.
              </caption>
              <thead>
                <tr className="border-b border-rule text-left text-xs uppercase tracking-[0.1em] text-ink-muted">
                  <th scope="col" className="px-4 py-3 font-semibold">Pick</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Published</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Entry</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Last</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Return</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">S&amp;P</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">vs S&amp;P</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ pick, perf }) => (
                  <tr key={pick.slug} className="border-b border-rule transition-colors last:border-0 hover:bg-surface-alt">
                    <th scope="row" className="px-4 py-3 text-left font-normal">
                      <Link href={`/variant-view/${pick.slug}`} className="group inline-flex items-baseline gap-2">
                        <span className="font-semibold text-ink-strong group-hover:underline">{pick.ticker}</span>
                        <span className="text-ink-muted">{pick.company}</span>
                        {pick.stance === "Short" && (
                          <span className="rounded bg-tag px-1 text-[10px] font-semibold uppercase text-tag-ink">Short</span>
                        )}
                      </Link>
                    </th>
                    <td className="px-4 py-3 text-ink-muted">{formatShortDate(pick.published)}</td>
                    <td className="px-4 py-3 text-right">${formatPrice(pick.priceAtPublication)}</td>
                    <td className="px-4 py-3 text-right">${formatPrice(perf.current)}</td>
                    <td className="px-4 py-3 text-right"><Change value={perf.pickReturn} /></td>
                    <td className="px-4 py-3 text-right"><Change value={perf.spxReturn} /></td>
                    <td className="px-4 py-3 text-right font-semibold"><Change value={perf.excess} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          Returns use the price at publication and the latest daily close. Short picks count as positive when the stock falls. Excludes dividends. Not investment advice.
        </p>
      </PageSection>
    </>
  );
}
