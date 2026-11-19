import Link from "next/link";
import { site } from "@/lib/site";
import { Logo } from "./Logo";

/**
 * Logo monogram + serif newsletter name. Used in the header and footer.
 * `tone="light"` is for navy backgrounds (white text).
 */
export function Wordmark({
  size = "md",
  tone = "default",
}: {
  size?: "sm" | "md" | "lg";
  tone?: "default" | "light";
}) {
  const logoPx = { sm: 28, md: 36, lg: 52 }[size];
  const text = {
    sm: "text-lg",
    md: "text-lg whitespace-nowrap sm:text-2xl",
    lg: "text-3xl sm:text-5xl",
  }[size];
  const color = tone === "light" ? "text-white" : "text-ink-strong";

  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3"
      aria-label={`${site.name}, home`}
    >
      <Logo size={logoPx} />
      <span
        className={`font-serif font-semibold tracking-tight ${text} ${color} transition-opacity group-hover:opacity-80`}
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
      >
        {site.name}
      </span>
    </Link>
  );
}
