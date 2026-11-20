import type { Metadata } from "next";
import { TrendChart } from "@/components/charts";
import { MoverTable } from "@/components/MoverTable";
import { PageHeader, PageSection } from "@/components/PageHeader";
import { SectorHeatmap } from "@/components/SectorHeatmap";
import { Card, Change } from "@/components/ui";
import { formatChange, formatPct, formatPrice } from "@/lib/format";
import { getTodayIssue } from "@/lib/issue";
import { getSectorPerformance, getSpxHistory, getTickerQuotes, getTopMovers } from "@/lib/marketData";

export const metadata: Metadata = {
  title: "Market Pulse",
  description: "Daily index performance, top movers, sector heatmap, and the editor's take.",
};

const INDEX_SYMBOLS = ["SPX", "NDX", "DJI", "RUT"];

export default async function MarketPulsePage() {
  const [ticker, movers, sectors, spx, issue] = await Promise.all([
    getTickerQuotes(),
    getTopMovers(),
    getSectorPerformance(),
    getSpxHistory(),
    getTodayIssue(),
  ]);
  const indices = ticker.data.filter((q) => INDEX_SYMBOLS.includes(q.symbol));
  const anySample = ticker.isSample || movers.isSample || sectors.isSample || spx.isSample;

  // S&P change over the charted window
  const first = spx.data[0]?.value ?? 0;
  const last = spx.data.at(-1)?.value ?? 0;
  const monthChange = first ? last / first - 1 : 0;

  // Look up price data for the editor's notable movers, if they're in today's lists
  const allMovers = [...movers.data.gainers, ...movers.data.losers];

  return (
    <>
      <PageHeader
        tag="Market Pulse · Daily"
        title={issue.headline}
        dek={issue.dek}
        isSample={anySample}
        meta="Refreshes about every 30 minutes during market hours"
      />

      {/* Indices */}
      <PageSection title="The indices">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {indices.map((q) => (
            <Card key={q.symbol} className="!p-4 sm:!p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{q.name}</div>
              <div className="num mt-2 text-2xl font-semibold text-ink-strong sm:text-3xl">{formatPrice(q.price)}</div>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <Change value={q.changePct} />
                <span className="num text-ink-muted">{formatChange(q.change)}</span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold">S&amp;P 500, past month</h3>
            <span className="text-sm text-ink-muted">
              <Change value={monthChange} /> over the period
            </span>
          </div>
          <div className="mt-4">
            <TrendChart
              data={spx.data}
              label={`S&P 500 daily closes over the past month, ${formatPct(monthChange)} overall.`}
            />
          </div>
        </Card>
      </PageSection>

      {/* Gainers & losers */}
      <PageSection title="Top movers" aside="U.S. stocks over $5">
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <MoverTable title="Top 5 gainers" items={movers.data.gainers} />
          </Card>
          <Card>
            <MoverTable title="Top 5 losers" items={movers.data.losers} />
          </Card>
        </div>
      </PageSection>

      {/* Sectors */}
      <PageSection id="sectors" title="Sector heatmap" aside="SPDR sector ETFs, today">
        <SectorHeatmap sectors={sectors.data} />
      </PageSection>

      {/* Notable movers with editor notes */}
      <PageSection title="Why it moved">
        <ul className="divide-y divide-rule rounded-2xl border border-rule bg-surface shadow-card">
          {issue.movers.map((m, i) => {
            const q = allMovers.find((x) => x.symbol === m.symbol);
            return (
              <li key={`${m.symbol}-${i}`} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
                <div className="flex w-40 shrink-0 items-baseline gap-3">
                  <span className="num text-lg font-semibold text-ink-strong">{m.symbol}</span>
                  {q && <Change value={q.changePct} className="text-sm" />}
                </div>
                <p className="text-ink">{m.note}</p>
              </li>
            );
          })}
        </ul>
      </PageSection>

      {/* Editor's take */}
      <PageSection title="Editor's take">
        <blockquote className="band-alt rounded-2xl border-l-4 border-navy p-6 font-serif text-xl leading-snug text-ink-strong sm:p-8 sm:text-2xl dark:border-light-blue">
          {issue.editorsTake}
        </blockquote>
      </PageSection>
    </>
  );
}
