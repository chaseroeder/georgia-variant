"use client";

/**
 * Lazy-loaded charts.
 *
 * The chart library (Recharts) is ~120 KB. Loading it with next/dynamic
 * means the page's text, numbers, and navigation show up and work first;
 * the charts load a moment later, with a same-size placeholder so nothing
 * jumps around. Pages import charts from here, not from the files directly.
 */
import dynamic from "next/dynamic";

function ChartPlaceholder({ height }: { height: number }) {
  return <div aria-hidden="true" className="animate-pulse rounded-xl bg-surface-alt" style={{ height }} />;
}

export const TrendChart = dynamic(() => import("./TrendChart").then((m) => m.TrendChart), {
  ssr: false,
  loading: () => <ChartPlaceholder height={220} />,
});

export const YieldCurveChart = dynamic(() => import("./YieldCurveChart").then((m) => m.YieldCurveChart), {
  ssr: false,
  loading: () => <ChartPlaceholder height={320} />,
});

export const ReturnsChart = dynamic(() => import("./ReturnsChart").then((m) => m.ReturnsChart), {
  ssr: false,
  loading: () => <ChartPlaceholder height={290} />,
});
