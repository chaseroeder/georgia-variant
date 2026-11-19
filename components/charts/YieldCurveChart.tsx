"use client";

import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { CurvePoint } from "@/lib/macroData";
import { useTheme } from "../useTheme";
import { chartTheme } from "./chartTheme";

/**
 * Treasury yield curve: today vs 1 month ago vs 1 year ago.
 *
 * Accessibility: each line has its own dash pattern, a legend, and a
 * direct label at its right end. A data table sits below the chart.
 */
const SERIES = [
  { key: "today", label: "Today", dash: undefined, width: 2.5 },
  { key: "monthAgo", label: "1 month ago", dash: "6 4", width: 2 },
  { key: "yearAgo", label: "1 year ago", dash: "2 4", width: 2 },
] as const;

const CHART_HEIGHT = 288; // matches h-72
const PLOT_HEIGHT = CHART_HEIGHT - 8 - 30; // minus top margin and x-axis
const LABEL_GAP = 13; // minimum px between right-edge labels

/**
 * Fixed y-axis domain, rounded out to the nearest 0.25%. Knowing the domain
 * lets us convert yields to pixels and keep the end labels from overlapping.
 */
function yDomain(points: CurvePoint[]): [number, number] {
  const all = points.flatMap((p) => [p.today, p.monthAgo, p.yearAgo]);
  return [Math.floor(Math.min(...all) * 4) / 4, Math.ceil(Math.max(...all) * 4) / 4];
}

/** Vertical nudge (px) for each end label so none overlap */
function labelOffsets(points: CurvePoint[], [lo, hi]: [number, number]): Record<string, number> {
  const end = points[points.length - 1];
  const toPx = (v: number) => ((hi - v) / (hi - lo)) * PLOT_HEIGHT;
  // Top to bottom by where each line actually ends
  const items = SERIES.map((s) => ({ key: s.key, y: toPx(end[s.key]) })).sort((a, b) => a.y - b.y);
  const placed: number[] = [];
  items.forEach((it, i) => placed.push(i === 0 ? it.y : Math.max(it.y, placed[i - 1] + LABEL_GAP)));
  return Object.fromEntries(items.map((it, i) => [it.key, placed[i] - it.y]));
}

export function YieldCurveChart({ points }: { points: CurvePoint[] }) {
  const c = chartTheme[useTheme()];
  const last = points.length - 1;
  const domain = yDomain(points);
  const offsets = labelOffsets(points, domain);
  // Gridlines every 0.25% (or 0.5% if the range is wide)
  const step = domain[1] - domain[0] > 2 ? 0.5 : 0.25;
  const ticks: number[] = [];
  for (let t = domain[0]; t <= domain[1] + 1e-9; t += step) ticks.push(Number(t.toFixed(2)));

  return (
    <div>
      {/* Legend */}
      <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-muted">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <svg width="22" height="8" aria-hidden="true">
              <line x1="0" y1="4" x2="22" y2="4" stroke={c.curve[s.key]} strokeWidth={s.width} strokeDasharray={s.dash} />
            </svg>
            {s.label}
          </li>
        ))}
      </ul>

      <div
        role="img"
        aria-label="Treasury yield curve from 1-month to 30-year maturities, today compared with one month and one year ago. Data table follows."
        className="num -mx-2 h-72"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 44, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={c.grid} />
            <XAxis dataKey="maturity" tick={{ fill: c.muted, fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={10} />
            <YAxis
              domain={domain}
              ticks={ticks}
              tickFormatter={(v: number) => `${v.toFixed(2)}%`}
              tick={{ fill: c.muted, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip
              cursor={{ stroke: c.muted, strokeWidth: 1, strokeDasharray: "3 3" }}
              content={(props: TooltipContentProps<ValueType, NameType>) => <CurveTooltip {...props} />}
            />
            {/* Draw the faintest line first so "today" sits on top */}
            {[...SERIES].reverse().map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={c.curve[s.key]}
                strokeWidth={s.width}
                strokeDasharray={s.dash}
                dot={false}
                activeDot={{ r: 4, stroke: c.surface, strokeWidth: 2, fill: c.curve[s.key] }}
                isAnimationActive={false}
              >
                {/* Direct label at the 30Y end of each line */}
                <LabelList
                  dataKey={s.key}
                  content={({ x, y, index }) =>
                    index === last ? (
                      <text x={Number(x) + 6} y={Number(y) + 4 + offsets[s.key]} fontSize={11} fill={c.muted}>
                        {s.key === "today" ? "Now" : s.key === "monthAgo" ? "1M" : "1Y"}
                      </text>
                    ) : null
                  }
                />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data table, collapsed by default */}
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted hover:text-ink-strong">
          View data table
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="num w-full text-right text-sm">
            <thead className="text-xs text-ink-muted">
              <tr className="border-b border-rule">
                <th scope="col" className="py-2 text-left font-medium">Maturity</th>
                {SERIES.map((s) => (
                  <th key={s.key} scope="col" className="py-2 font-medium">{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.maturity} className="border-b border-rule last:border-0">
                  <th scope="row" className="py-1.5 text-left font-medium text-ink-strong">{p.maturity}</th>
                  <td className="py-1.5">{p.today.toFixed(2)}%</td>
                  <td className="py-1.5">{p.monthAgo.toFixed(2)}%</td>
                  <td className="py-1.5">{p.yearAgo.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function CurveTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  // Show rows in our fixed order (today first), not render order
  const byKey = new Map(payload.map((p) => [String(p.dataKey), Number(p.value)]));
  return (
    <div className="rounded-lg border border-rule bg-surface px-3 py-2 text-xs shadow-card">
      <div className="mb-1 font-semibold text-ink-strong">{label} Treasury</div>
      {SERIES.map((s) => (
        <div key={s.key} className="flex justify-between gap-6">
          <span className="text-ink-muted">{s.label}</span>
          <span className="num font-medium text-ink">{byKey.get(s.key)?.toFixed(2)}%</span>
        </div>
      ))}
    </div>
  );
}
