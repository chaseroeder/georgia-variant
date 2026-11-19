"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

/**
 * Section links in the navy nav bar.
 * On phones the row scrolls sideways instead of hiding behind a
 * hamburger menu, so every section stays one tap away.
 */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex snap-x gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:justify-center sm:px-0 [&::-webkit-scrollbar]:hidden">
      {site.nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href} className="snap-start">
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative block whitespace-nowrap px-3 py-3 text-[13px] font-medium tracking-wide transition-colors ${
                active ? "text-white" : "text-white/75 hover:text-white"
              }`}
            >
              {item.label}
              {/* Light-blue underline marks the current section */}
              <span
                aria-hidden="true"
                className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-light-blue transition-opacity ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
