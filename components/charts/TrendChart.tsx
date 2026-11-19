"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { formatPrice } from "@/lib/format";
import { useTheme } from "../useTheme";
import { chartTheme } from "./chartTheme";

/**
 * A single-series line chart with a soft area fill and a hover crosshair.
 * Used for the S&P 500 month view and the 2s10s spread history.
 *
 * `valueFormat` is a string (not a function) because this is a Client
 * Component, and functions can't be passed from server to client.
 */
type ValueFormat = "price" | "price2" | "bp";

// For "bp" charts we convert the data to basis points before plotting
// (0.54 → 54), so the axis picks round tick values.
function fmt(v: number, kind: ValueFormat): string {
  if (kind === "bp") return `${Math.round(v)} bp`;
  if (kind === "price2") return `$${formatPrice(v, 2)}`;
  return formatPrice(v, 0);
}

function shortDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function TrendChart({
  data,
  valueFormat = "price",
  showZero = false,
  label,
  height = 220,
  baseline,
  markerDate,
  markerLabel,
}: {
  data: { date: string; value: number }[];
  valueFormat?: ValueFormat;
  showZero?: boolean;
  /** Screen-reader description of what the chart shows */
  label: string;
  height?: number;
  /** Optional dashed horizontal line, e.g. price at publication */
  baseline?: number;
  /** Optional dashed vertical line at this date, e.g. the publish date */
  markerDate?: string;
  markerLabel?: string;
}) {
  const c = chartTheme[useTheme()];
  const plotted = valueFormat === "bp" ? data.map((d) => ({ ...d, value: d.value * 100 })) : data;
  const gradientId = `trend-${valueFormat}`;

  return (
    <div role="img" aria-label={label} style={{ height }} className="num -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={plotted} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.areaFill} stopOpacity={0.18} />
              <stop offset="100%" stopColor={c.areaFill} stopOpacity={0} />
            </linearGradient>
          </defs>
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
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => fmt(v, valueFormat)}
            tick={{ fill: c.muted, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={valueFormat === "bp" ? 48 : 52}
          />
          {showZero && <ReferenceLine y={0} stroke={c.zero} strokeDasharray="3 3" />}
          {baseline !== undefined && <ReferenceLine y={baseline} stroke={c.zero} strokeDasharray="3 3" />}
          {markerDate && (
            <ReferenceLine
              x={markerDate}
              stroke={c.zero}
              strokeDasharray="3 3"
              label={markerLabel ? { value: markerLabel, position: "insideTopLeft", fill: c.muted, fontSize: 11 } : undefined}
            />
          )}
          <Tooltip
            cursor={{ stroke: c.muted, strokeWidth: 1, strokeDasharray: "3 3" }}
            content={(props: TooltipContentProps<ValueType, NameType>) => (
              <ChartTooltip {...props} valueFormat={valueFormat} />
            )}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={c.primary}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, stroke: c.surface, strokeWidth: 2, fill: c.primary }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  valueFormat,
}: TooltipContentProps<ValueType, NameType> & { valueFormat: ValueFormat }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-rule bg-surface px-3 py-2 text-xs shadow-card">
      <div className="text-ink-muted">{shortDate(String(label))}</div>
      <div className="num mt-0.5 text-sm font-semibold text-ink-strong">
        {fmt(Number(payload[0].value), valueFormat)}
      </div>
    </div>
  );
}
