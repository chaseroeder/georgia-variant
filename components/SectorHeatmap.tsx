import { formatPct } from "@/lib/format";
import type { SectorPerf } from "@/lib/types";

/**
 * Heatmap of the 11 SPDR sector ETFs.
 *
 * Color = direction (green up / red down); strength = size of the move,
 * capped at ±2%. Each tile also prints the number and an arrow, so the
 * color is never the only way to read it.
 *
 * The tint is made with CSS color-mix() from our theme variables, so it
 * adapts to dark mode automatically. It's capped at 45% strength, which
 * keeps the text readable (AA contrast) in both themes.
 */
const CAP = 0.02; // a ±2% day gets the strongest tint

export function SectorHeatmap({ sectors }: { sectors: SectorPerf[] }) {
  return (
    <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
      {sectors.map((s) => {
        const strength = Math.min(Math.abs(s.changePct) / CAP, 1);
        const pct = Math.round(8 + strength * 37); // 8% … 45%
        const color = s.changePct >= 0 ? "var(--gain)" : "var(--loss)";
        return (
          <li
            key={s.symbol}
            className="flex min-h-24 flex-col justify-between rounded-xl p-3 transition-transform hover:-translate-y-0.5"
            style={{ background: `color-mix(in srgb, ${color} ${pct}%, var(--surface))` }}
            title={`${s.name} (${s.symbol}): ${formatPct(s.changePct)}`}
          >
            <div>
              <div className="num text-sm font-semibold text-ink-strong">{s.symbol}</div>
              <div className="text-xs text-ink">{s.name}</div>
            </div>
            <div className="num mt-2 text-lg font-semibold text-ink-strong">
              <span aria-hidden="true" className="mr-1 text-xs">
                {s.changePct >= 0 ? "▲" : "▼"}
              </span>
              {formatPct(s.changePct)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
