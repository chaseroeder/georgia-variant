import Link from "next/link";
import { Change, Card, CardCta, SampleBadge, SectionTag } from "@/components/ui";
import { TickerStrip } from "@/components/TickerStrip";
import { MoverTable } from "@/components/MoverTable";
import { Avatar } from "@/components/Avatar";
import { SubscribeForm } from "@/components/SubscribeForm";
import { getAlumni, getVariantPicks } from "@/lib/content";
import { formatShortDate } from "@/lib/format";
import { getTodayIssue } from "@/lib/issue";
import { getMacroSnapshot } from "@/lib/macroData";
import { getSectorPerformance, getTickerQuotes, getTopMovers } from "@/lib/marketData";

/**
 * Home / Today's Issue.
 *
 * Layout, top to bottom:
 *   1. Navy hero bar with the market ticker
 *   2. Issue headline + editor's take
 *   3. One card per section of today's issue
 */
export default async function HomePage() {
  // Fetch in parallel. Each result says whether it's sample data.
  const [ticker, movers, sectors, macro, issue] = await Promise.all([
    getTickerQuotes(),
    getTopMovers(),
    getSectorPerformance(),
    getMacroSnapshot(),
    getTodayIssue(),
  ]);
  const m = macro.data;
  const latestPick = getVariantPicks()[0];
  const latestAlum = getAlumni()[0];
  const anySample = ticker.isSample || movers.isSample || sectors.isSample || macro.isSample;

  return (
    <>
      {/* 1. Hero ticker bar */}
      <section aria-label="Markets" className="bg-navy dark:bg-navy-deep dark:border-b dark:border-white/10">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-2 sm:px-4">
          <TickerStrip quotes={ticker.data} />
        </div>
      </section>

      {/* 2. Lead story */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <div className="flex flex-wrap items-center gap-3">
          <SectionTag>Issue of {formatShortDate(issue.date)}</SectionTag>
          {issue.draft && <SampleBadge label="Draft (only visible in dev)" />}
          {issue.sample && <SampleBadge label="Sample issue" />}
          {anySample && <SampleBadge />}
        </div>
        <h1
          className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-6xl"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {issue.headline}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">{issue.dek}</p>

        <figure className="mt-8 max-w-3xl border-l-2 border-rule-strong pl-5">
          <figcaption className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Editor&rsquo;s take
          </figcaption>
          <blockquote className="mt-2 font-serif text-xl leading-snug text-ink-strong sm:text-2xl">
            {issue.editorsTake}
          </blockquote>
        </figure>

        {issue.slug !== "sample" && (
          <Link
            href={`/archive/${issue.date}`}
            className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-ink-strong underline-offset-4 hover:underline"
          >
            Read the full issue <span aria-hidden="true">→</span>
          </Link>
        )}
      </section>

      <hr className="mx-auto mt-12 max-w-6xl border-rule" />

      {/* 3. Section cards */}
      <section aria-label="In today's issue" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 md:grid-cols-6">
          {/* Market Pulse: wide card */}
          <Card href="/market-pulse" className="md:col-span-4">
            <SectionTag>Market Pulse · Daily</SectionTag>
            <h2 className="mt-3 text-2xl font-semibold">Where the tape went</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <MoverTable title="Top gainers" items={movers.data.gainers.slice(0, 3)} />
              <MoverTable title="Top losers" items={movers.data.losers.slice(0, 3)} />
            </div>
            <ul className="mt-6 space-y-2 border-t border-rule pt-4 text-sm">
              {issue.movers.map((m, i) => (
                <li key={`${m.symbol}-${i}`} className="flex gap-3">
                  <span className="num w-12 shrink-0 font-semibold text-ink-strong">{m.symbol}</span>
                  <span className="text-ink-muted">{m.note}</span>
                </li>
              ))}
            </ul>
            <CardCta>Full Market Pulse</CardCta>
          </Card>

          {/* Sector snapshot */}
          <Card href="/market-pulse#sectors" className="md:col-span-2">
            <SectionTag>Sectors</SectionTag>
            <h2 className="mt-3 text-2xl font-semibold">Leaders &amp; laggards</h2>
            <ul className="mt-5 space-y-2.5">
              {[...sectors.data.slice(0, 3), ...sectors.data.slice(-3)].map((s) => (
                <li key={s.symbol} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-ink">
                    <span className="num mr-2 font-semibold text-ink-strong">{s.symbol}</span>
                    {s.name}
                  </span>
                  <Change value={s.changePct} />
                </li>
              ))}
            </ul>
            <CardCta>Sector heatmap</CardCta>
          </Card>

          {/* Macro Desk */}
          <Card href="/macro" className="md:col-span-3">
            <SectionTag>Macro Desk</SectionTag>
            <h2 className="mt-3 text-2xl font-semibold">Rates &amp; the economy</h2>
            <dl className="mt-5 grid grid-cols-3 gap-4">
              <Stat label="2Y" value={`${m.y2.value.toFixed(2)}%`} />
              <Stat label="10Y" value={`${m.y10.value.toFixed(2)}%`} />
              <Stat label="2s10s" value={`${Math.round(m.spread2s10s.value * 100)} bp`} />
              <Stat label="Fed funds" value={`${m.fedFunds.value.toFixed(2)}%`} />
              <Stat label="CPI YoY" value={`${(m.cpiYoY.value * 100).toFixed(1)}%`} />
              <Stat label="Next FOMC" value={m.nextFomc ? formatShortDate(m.nextFomc).replace(/, \d{4}$/, "") : "TBA"} />
            </dl>
            <p className="mt-5 text-sm leading-relaxed text-ink-muted">{issue.macroCommentary}</p>
            <CardCta>Macro Desk</CardCta>
          </Card>

          {/* Variant View: the newest pick from content/variant-view/ */}
          {latestPick && (
            <Card href={`/variant-view/${latestPick.slug}`} className="md:col-span-3">
              <SectionTag>Variant View · Weekly</SectionTag>
              <div className="mt-3 flex items-baseline gap-3">
                <h2 className="text-2xl font-semibold">{latestPick.company}</h2>
                <span className="num rounded-md border border-rule px-1.5 py-0.5 text-xs font-semibold text-ink-muted">
                  {latestPick.ticker}
                </span>
              </div>
              <p className="mt-4 font-serif text-lg leading-snug text-ink">{latestPick.headline}</p>
              <CardCta>Read the thesis</CardCta>
            </Card>
          )}

          {/* Founders Center: the newest profile from content/alumni/ */}
          {latestAlum && (
            <Card href={`/founders/${latestAlum.slug}`} className="band-alt md:col-span-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex max-w-2xl items-start gap-4">
                  <Avatar name={latestAlum.name} photo={latestAlum.photo} size={56} />
                  <div>
                    <SectionTag>Emory Founders Center</SectionTag>
                    <h2 className="mt-3 text-2xl font-semibold">{latestAlum.headline}</h2>
                    <p className="mt-2 text-sm text-ink-muted">
                      {latestAlum.name} ’{String(latestAlum.classYear).slice(-2)} · {latestAlum.role}, {latestAlum.firm}
                    </p>
                  </div>
                </div>
                <CardCta>Read the profile</CardCta>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* 4. Subscribe band */}
      <section aria-labelledby="home-subscribe" className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl bg-navy p-6 text-white shadow-card sm:p-10 dark:border dark:border-white/10 dark:bg-navy-deep">
          <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-center">
            <div>
              <h2 id="home-subscribe" className="text-3xl font-semibold text-white">
                Get this in your inbox
              </h2>
              <p className="mt-2 text-white/80">Every weekday before the opening bell. Free.</p>
            </div>
            <SubscribeForm tone="navy" />
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-[0.1em] text-ink-muted">{label}</dt>
      <dd className="num mt-1 text-lg font-semibold text-ink-strong">{value}</dd>
    </div>
  );
}
