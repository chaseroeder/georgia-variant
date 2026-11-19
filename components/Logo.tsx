import { siteInitials } from "@/lib/site";

/**
 * Our original logo: the newsletter's initials in the serif typeface,
 * sitting on two thin light-blue "ledger lines," on a navy tile.
 *
 * It's built from the site name, so renaming the newsletter in
 * lib/site.ts updates the logo too. No university marks are used.
 */
export function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  const initials = siteInitials();
  const two = initials.length > 1;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <rect width="64" height="64" rx="14" fill="#012169" />
      <rect x="1" y="1" width="62" height="62" rx="13" fill="none" stroke="#B9D9EB" strokeOpacity="0.35" strokeWidth="1.5" />
      <text
        x="32"
        y={two ? 39 : 42}
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="var(--font-fraunces), Georgia, serif"
        fontWeight="600"
        fontSize={two ? 26 : 34}
        letterSpacing={two ? -0.5 : 0}
      >
        {initials}
      </text>
      {/* Ledger lines */}
      <line x1="16" y1="47" x2="48" y2="47" stroke="#B9D9EB" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="16" y1="51.5" x2="48" y2="51.5" stroke="#B9D9EB" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.55" />
    </svg>
  );
}
