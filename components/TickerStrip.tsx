"use client";

import { useState } from "react";
import { formatBp, formatPrice } from "@/lib/format";
import type { Quote } from "@/lib/types";
import { Change } from "./ui";

/**
 * Scrolling market ticker on the navy hero bar.
 *
 * Accessibility notes:
 * - Moving content must be pausable (WCAG 2.2.2), so there's a pause
 *   button, and it also pauses on hover / keyboard focus.
 * - Readers who set "reduce motion" get a static, swipeable row instead.
 * - The list is duplicated to make the loop seamless; the copy is hidden
 *   from screen readers so values aren't read twice.
 */
export function TickerStrip({ quotes }: { quotes: Quote[] }) {
  const [paused, setPaused] = useState(false);

  return (
    <div className="flex w-full min-w-0 items-stretch">
      <div
        className="ticker-viewport relative min-w-0 flex-1 overflow-hidden motion-reduce:overflow-x-auto"
        // Fade the edges so items glide in and out
        style={{
          maskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
        }}
      >
        <div className={`ticker-track flex w-max ${paused ? "is-paused" : ""}`}>
          <TickerList quotes={quotes} />
          <TickerList quotes={quotes} hidden />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Play ticker" : "Pause ticker"}
        className="ml-2 inline-flex size-8 shrink-0 items-center justify-center self-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white motion-reduce:hidden"
      >
        {paused ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M3 1.5v9l7-4.5z" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <rect x="2" y="1.5" width="3" height="9" rx="0.5" />
            <rect x="7" y="1.5" width="3" height="9" rx="0.5" />
          </svg>
        )}
      </button>
    </div>
  );
}

function TickerList({ quotes, hidden = false }: { quotes: Quote[]; hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      aria-label={hidden ? undefined : "Market snapshot"}
      className={`flex shrink-0 ${hidden ? "motion-reduce:hidden" : ""}`}
    >
      {quotes.map((q) => (
        <li
          key={q.symbol}
          className="flex items-baseline gap-2 whitespace-nowrap border-r border-white/10 px-5 py-3 text-sm"
        >
          <span className="font-medium text-white/70">{q.name}</span>
          <span className="num font-semibold text-white">
            {q.kind === "yield"
              ? `${q.price.toFixed(2)}%`
              : formatPrice(q.price, q.kind === "crypto" ? 0 : 2)}
          </span>
          {q.kind === "yield" ? (
            <span className={`num text-xs font-medium ${q.change >= 0 ? "text-gain-on-navy" : "text-loss-on-navy"}`}>
              {formatBp(q.change)}
            </span>
          ) : (
            <Change value={q.changePct} onNavy className="text-xs" />
          )}
        </li>
      ))}
    </ul>
  );
}
