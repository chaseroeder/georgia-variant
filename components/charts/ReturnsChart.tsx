"use client";

import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { formatPct } from "@/lib/format";
import { useTheme } from "../useTheme";
import { chartTheme } from "./chartTheme";

/**
 * Our pick vs the S&P 500, both shown as % return since publication.
 * Because both start at 0%, one y-axis fits both lines fairly.
 *
 * Lines differ by color AND dash pattern, and each is labeled at its end.
 */
function shortDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function ReturnsChart({
  data,
  ticker,
}: {
  data: { date: string; pick: number; spx: number }[];
  ticker: string;
}) {
  const c = chartTheme[useTheme()];
  const last = data.length - 1;
  const series = [
    { key: "pick", label: ticker, color: c.compare.pick, dash: undefined, width: 2.5 },
    { key: "spx", label: "S&P 500", color: c.compare.spx, dash: "6 4", width: 2 },
  ] as const;

  // Nudge the end labels apart if the lines finish close together
  const end = data[last] ?? { pick: 0, spx: 0 };
  const close = Math.abs(end.pick - end.spx) < 0.01;
  const nudge = { pick: close ? (end.pick >= end.spx ? -7 : 7) : 0, spx: close ? (end.pick >= end.spx ? 7 : -7) : 0 };

  return (
    <div>
      <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-muted">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <svg width="22" height="8" aria-hidden="true">
              <line x1="0" y1="4" x2="22" y2="4" stroke={s.color} strokeWidth={s.width} strokeDasharray={s.dash} />
            </svg>
            {s.label}
          </li>
        ))}
      </ul>
      <div
        role="img"
        aria-label={`${ticker} return since publication compared with the S&P 500: ${formatPct(end.pick)} versus ${formatPct(end.spx)}.`}
        className="num -mx-2 h-64"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 56, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={c.grid} />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              tick={{ fill: c.muted, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={36}
            />
            <YAxis
              tickFormatter={(v: number) => formatPct(v, 0)}
              tick={{ fill: c.muted, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <ReferenceLine y={0} stroke={c.zero} strokeDasharray="3 3" />
            <Tooltip
              cursor={{ stroke: c.muted, strokeWidth: 1, strokeDasharray: "3 3" }}
              content={(props: TooltipContentProps<ValueType, NameType>) => (
                <ReturnsTooltip {...props} ticker={ticker} />
              )}
            />
            {[...series].reverse().map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={s.width}
                strokeDasharray={s.dash}
                dot={data.length === 1 ? { r: 4, fill: s.color } : false}
                activeDot={{ r: 4, stroke: c.surface, strokeWidth: 2, fill: s.color }}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey={s.key}
                  content={({ x, y, index }) =>
                    index === last ? (
                      <text x={Number(x) + 6} y={Number(y) + 4 + nudge[s.key]} fontSize={11} fill={c.muted}>
                        {s.key === "pick" ? ticker : "S&P"}
                      </text>
                    ) : null
                  }
                />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ReturnsTooltip({
  active,
  payload,
  label,
  ticker,
}: TooltipContentProps<ValueType, NameType> & { ticker: string }) {
  if (!active || !payload?.length) return null;
  const byKey = new Map(payload.map((p) => [String(p.dataKey), Number(p.value)]));
  return (
    <div className="rounded-lg border border-rule bg-surface px-3 py-2 text-xs shadow-card">
      <div className="mb-1 text-ink-muted">{shortDate(String(label))}</div>
      <div className="flex justify-between gap-6">
        <span className="text-ink-muted">{ticker}</span>
        <span className="num font-semibold text-ink-strong">{formatPct(byKey.get("pick") ?? 0)}</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-ink-muted">S&amp;P 500</span>
        <span className="num font-semibold text-ink-strong">{formatPct(byKey.get("spx") ?? 0)}</span>
      </div>
    </div>
  );
}
