import type { Metadata } from "next";
import { TrendChart } from "@/components/charts";
import { YieldCurveChart } from "@/components/charts";
import { PageHeader, PageSection } from "@/components/PageHeader";
import { Card } from "@/components/ui";
import { formatBp, formatShortDate } from "@/lib/format";
import { getTodayIssue } from "@/lib/issue";
import { getMacroSnapshot, getSpreadHistory, getYieldCurve, type RatePoint } from "@/lib/macroData";

export const metadata: Metadata = {
  title: "Macro Desk",
  description: "Treasury yields, the yield curve, the Fed, inflation, jobs, and growth.",
};

/** "Oct 2026" from "2026-10-01" */
function monthLabel(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}
/** "Q3 2026" from "2026-07-01" */
function quarterLabel(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  return `Q${Math.floor(d.getUTCMonth() / 3) + 1} ${d.getUTCFullYear()}`;
}

export default async function MacroPage() {
  const [macro, curve, spread, issue] = await Promise.all([
    getMacroSnapshot(),
    getYieldCurve(),
    getSpreadHistory(),
    getTodayIssue(),
  ]);
  const m = macro.data;
  const anySample = macro.isSample || curve.isSample || spread.isSample;
  const inverted = m.spread2s10s.value < 0;

  return (
    <>
      <PageHeader
        tag="Macro Desk"
        title="Rates, the Fed & the economy"
        dek={issue.macroCommentary}
        isSample={anySample}
        meta={`Treasury data as of ${formatShortDate(m.y10.date)}`}
      />

      {/* Yields */}
      <PageSection title="Treasury yields" aside="Change vs prior day">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <YieldCard label="2-year" point={m.y2} />
          <YieldCard label="10-year" point={m.y10} />
          <YieldCard label="30-year" point={m.y30} />
          <YieldCard
            label="2s10s spread"
            point={m.spread2s10s}
            display={`${Math.round(m.spread2s10s.value * 100)} bp`}
            note={inverted ? "Inverted: 2Y above 10Y" : "Positive: 10Y above 2Y"}
          />
        </div>
      </PageSection>

      {/* Charts */}
      <PageSection title="The yield curve" aside={`As of ${formatShortDate(curve.data.asOfDate)}`}>
        <div className="grid gap-3 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <YieldCurveChart points={curve.data.points} />
          </Card>
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold">2s10s spread, past year</h3>
            <p className="mt-1 text-sm text-ink-muted">
              Below zero means the curve is inverted, a classic recession signal.
            </p>
            <div className="mt-4">
              <TrendChart
                data={spread.data}
                valueFormat="bp"
                showZero
                height={240}
                label={`10-year minus 2-year Treasury spread over the past year, now ${Math.round(m.spread2s10s.value * 100)} basis points.`}
              />
            </div>
          </Card>
        </div>
      </PageSection>

      {/* Fed & economy */}
      <PageSection title="The Fed & the economy">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <StatLabel>Fed funds (effective)</StatLabel>
            <Big>{m.fedFunds.value.toFixed(2)}%</Big>
            <Sub>
              {m.targetRange
                ? `Target range ${m.targetRange.lower.toFixed(2)}–${m.targetRange.upper.toFixed(2)}%`
                : `As of ${monthLabel(m.fedFunds.date)}`}
            </Sub>
          </Card>
          <Card>
            <StatLabel>Next FOMC decision</StatLabel>
            {m.nextFomc ? (
              <>
                <Big>{formatShortDate(m.nextFomc).replace(/, \d{4}$/, "")}</Big>
                <Sub>
                  {m.nextFomcInDays === 0 ? "Today, 2:00 p.m. ET" : `In ${m.nextFomcInDays} days · 2:00 p.m. ET`}
                </Sub>
              </>
            ) : (
              <Sub>Update lib/fomc.ts with next year&rsquo;s dates</Sub>
            )}
          </Card>
          <Card>
            <StatLabel>CPI inflation (YoY)</StatLabel>
            <Big>{(m.cpiYoY.value * 100).toFixed(1)}%</Big>
            <Sub>{monthLabel(m.cpiYoY.date)} · headline CPI</Sub>
          </Card>
          <Card>
            <StatLabel>Unemployment</StatLabel>
            <Big>{m.unemployment.value.toFixed(1)}%</Big>
            <Sub>
              {monthLabel(m.unemployment.date)} ·{" "}
              {m.unemployment.change === 0
                ? "unchanged"
                : `${m.unemployment.change > 0 ? "up" : "down"} ${Math.abs(m.unemployment.change).toFixed(1)} pt`}
            </Sub>
          </Card>
          <Card className="sm:col-span-2 lg:col-span-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <StatLabel>GDP (nominal, annualized)</StatLabel>
                <Big>${m.gdp.level.toFixed(1)} trillion</Big>
              </div>
              <Sub>
                {quarterLabel(m.gdp.date)} · {m.gdp.qoqAnnualized >= 0 ? "+" : "−"}
                {Math.abs(m.gdp.qoqAnnualized * 100).toFixed(1)}% quarter over quarter, annualized (not inflation-adjusted)
              </Sub>
            </div>
          </Card>
        </div>
      </PageSection>

      {/* Commentary */}
      <PageSection title="Macro take">
        <blockquote className="band-alt rounded-2xl border-l-4 border-navy p-6 font-serif text-xl leading-snug text-ink-strong sm:p-8 sm:text-2xl dark:border-light-blue">
          {issue.macroCommentary}
        </blockquote>
        <p className="mt-3 text-xs text-ink-muted">
          Source: Federal Reserve Bank of St. Louis (FRED). Yields are daily closes.
        </p>
      </PageSection>
    </>
  );
}

/* Small presentational helpers */

function YieldCard({ label, point, display, note }: { label: string; point: RatePoint; display?: string; note?: string }) {
  const up = point.change > 0;
  const flat = point.change === 0;
  return (
    <Card className="!p-4 sm:!p-5">
      <StatLabel>{label}</StatLabel>
      <Big>{display ?? `${point.value.toFixed(2)}%`}</Big>
      {/* Yields up/down aren't "good" or "bad", so we use neutral ink plus an arrow */}
      <div className="num mt-1 text-sm font-medium text-ink-muted">
        <span aria-hidden="true" className="mr-1 text-[0.7em]">
          {flat ? "•" : up ? "▲" : "▼"}
        </span>
        {formatBp(point.change)}
      </div>
      {note && <div className="mt-1 text-xs text-ink-muted">{note}</div>}
    </Card>
  );
}

function StatLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{children}</div>;
}
function Big({ children }: { children: React.ReactNode }) {
  return <div className="num mt-2 text-2xl font-semibold text-ink-strong sm:text-3xl">{children}</div>;
}
function Sub({ children }: { children: React.ReactNode }) {
  return <div className="mt-1 text-sm text-ink-muted">{children}</div>;
}
