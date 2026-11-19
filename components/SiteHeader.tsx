import Link from "next/link";
import { IssueDate } from "./Dates";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import { Wordmark } from "./Wordmark";

/**
 * Masthead (date + wordmark + subscribe) and the sticky navy nav bar.
 *
 * The date is rendered on the server in New York time, which is the
 * "issue date" readers care about regardless of where they are.
 */
export function SiteHeader() {
  return (
    <header>
      {/* Masthead */}
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 sm:grid-cols-[1fr_auto_1fr] sm:px-6 sm:py-6">
        <p className="order-3 col-span-2 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted sm:order-none sm:col-span-1">
          <IssueDate />
        </p>

        <div className="sm:justify-self-center">
          <Wordmark size="md" />
        </div>

        <div className="flex items-center justify-end gap-2">
          <ThemeToggle className="text-ink-strong" />
          <Link
            href="/about#subscribe"
            className="rounded-full bg-navy px-3.5 py-1.5 text-sm font-semibold sm:px-4 sm:py-2 text-white shadow-card transition-all hover:-translate-y-px hover:shadow-card-hover dark:bg-light-blue dark:text-navy"
          >
            Subscribe
          </Link>
        </div>
      </div>

      {/* Sticky nav bar */}
      <nav aria-label="Sections" className="sticky top-0 z-40 border-y border-white/10 bg-navy">
        <div className="mx-auto max-w-6xl">
          <NavLinks />
        </div>
      </nav>
    </header>
  );
}
