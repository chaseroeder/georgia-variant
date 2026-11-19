import { formatPrice } from "@/lib/format";
import type { Mover } from "@/lib/types";
import { Change } from "./ui";

/** Compact list of stocks: ticker, name, price, % change */
export function MoverTable({ title, items }: { title: string; items: Mover[] }) {
  return (
    <div>
      <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{title}</h3>
      <ul className="mt-2 divide-y divide-rule">
        {items.map((m) => (
          <li key={m.symbol} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="min-w-0 truncate">
              <span className="num mr-2 font-semibold text-ink-strong">{m.symbol}</span>
              <span className="text-ink-muted">{m.name}</span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="num text-ink">{formatPrice(m.price)}</span>
              <Change value={m.changePct} className="w-[4.75rem] justify-end" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
