/**
 * Small, reusable UI building blocks.
 * Kept together because each one is only a few lines.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { direction, formatPct } from "@/lib/format";

/** Light-blue pill label, e.g. "MARKET PULSE · DAILY" */
export function SectionTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-tag px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-tag-ink">
      {children}
    </span>
  );
}

/**
 * Shown whenever data came from the mock fallback instead of a live API.
 * Pass a different `label` for placeholder *content* (e.g. "Sample pick").
 */
export function SampleBadge({ onNavy = false, label = "Sample data" }: { onNavy?: boolean; label?: string }) {
  return (
    <span
      title={
        label === "Sample data"
          ? "Live data isn't connected yet, so these are realistic placeholder numbers."
          : "Example content to show the layout. Replace it with the real thing."
      }
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
        onNavy ? "border-white/25 text-white/80" : "border-rule text-ink-muted"
      }`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-amber-400" />
      {label}
    </span>
  );
}

/**
 * A percent change colored green/red, with an arrow so color isn't the
 * only signal (helps color-blind readers).
 */
export function Change({
  value,
  onNavy = false,
  className = "",
}: {
  value: number;
  onNavy?: boolean;
  className?: string;
}) {
  const dir = direction(value);
  const color =
    dir === 0
      ? onNavy
        ? "text-white/70"
        : "text-ink-muted"
      : onNavy
        ? dir > 0
          ? "text-gain-on-navy"
          : "text-loss-on-navy"
        : dir > 0
          ? "text-gain"
          : "text-loss";
  const arrow = dir > 0 ? "▲" : dir < 0 ? "▼" : "•";
  return (
    <span className={`num inline-flex items-center gap-1 font-medium ${color} ${className}`}>
      <span aria-hidden="true" className="text-[0.7em]">
        {arrow}
      </span>
      {formatPct(value)}
    </span>
  );
}

/** Rounded card with a light shadow that lifts on hover when it's a link */
export function Card({
  children,
  href,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  className?: string;
}) {
  const base = `block rounded-2xl border border-rule bg-surface p-5 shadow-card sm:p-6 ${className}`;
  if (!href) return <div className={base}>{children}</div>;
  return (
    <Link
      href={href}
      className={`${base} group transition-all duration-200 hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-card-hover dark:hover:border-light-blue/40`}
    >
      {children}
    </Link>
  );
}

/** "Read more →" footer link inside a card */
export function CardCta({ children }: { children: ReactNode }) {
  return (
    <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-ink-strong">
      {children}
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </span>
  );
}
