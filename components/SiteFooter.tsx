import Link from "next/link";
import { site } from "@/lib/site";
import { CurrentYear } from "./Dates";
import { Wordmark } from "./Wordmark";

/** Footer on every page: logo, independence line, and disclaimer. */
export function SiteFooter() {
  return (
    <footer className="mt-24 bg-navy text-white dark:bg-navy-deep dark:border-t dark:border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm space-y-3">
            <Wordmark size="sm" tone="light" />
            <p className="text-sm leading-relaxed text-white/80">{site.footer.affiliation}</p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/80 transition-colors hover:text-light-blue">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-white/15 pt-6 text-xs leading-relaxed text-white/70">
          <p className="font-medium text-light-blue">{site.footer.disclaimer}</p>
          <p className="mt-1">
            © <CurrentYear /> {site.name}. Market data may be delayed.
          </p>
        </div>
      </div>
    </footer>
  );
}
