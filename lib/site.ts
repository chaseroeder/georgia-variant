/**
 * Site-wide configuration.
 *
 * Want to rename the newsletter? Change `name` here. Every page title,
 * the masthead, the logo monogram, the footer, share images, and the
 * emails read from it.
 */
export const site = {
  name: "The Georgia Variant",
  /** Short tagline under the masthead */
  tagline: "Markets, before your 8 a.m.",
  description:
    "An independent, student-run daily newsletter on financial markets: market moves, macro, a weekly contrarian stock pick, and Emory alumni in finance.",
  /** Used for absolute URLs (SEO, Open Graph). Set NEXT_PUBLIC_SITE_URL on Vercel. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /** Main navigation, in display order */
  nav: [
    { href: "/market-pulse", label: "Market Pulse" },
    { href: "/macro", label: "Macro Desk" },
    { href: "/variant-view", label: "Variant View" },
    { href: "/founders", label: "Founders Center" },
    { href: "/archive", label: "Archive" },
    { href: "/about", label: "About" },
  ],

  footer: {
    /**
     * We're an independent student publication: no university logos, and
     * a clear "not affiliated" line. Keep this unless you get official
     * approval from the university.
     */
    affiliation: "An independent student publication. Not affiliated with or endorsed by Emory University.",
    /** Short version for tight spaces (share images) */
    shortAffiliation: "An independent student publication",
    disclaimer: "For educational purposes only. Not investment advice.",
  },

  /** About page */
  about: {
    mission:
      "We're Emory students who think markets are easier to understand when someone explains them plainly. Every weekday morning we send a five-minute read on what moved, why, and what it means, written for students, not traders.",
    /** Edit this list with your real team. `role` shows under the name. */
    team: [
      { name: "Chase Roeder", role: "Co-Founder", school: "Emory ’30" },
      { name: "Luke Frey", role: "Co-Founder", school: "Emory ’30" },
    ],
  },

  /** Newsletter email settings (sending addresses live in .env.local) */
  email: {
    /**
     * U.S. anti-spam law (CAN-SPAM) expects a postal address in bulk email.
     * Add a mailing address you're allowed to use (e.g. a P.O. box or your
     * student org's mailbox) before sending to real subscribers.
     */
    postalAddress: "",
  },
} as const;

export type NavItem = (typeof site.nav)[number];

/**
 * Letters for the logo monogram, from the site name minus "The".
 * "The Georgia Variant" → "GV", "The Ledger" → "L". Max two letters.
 */
export function siteInitials(name: string = site.name): string {
  return name
    .replace(/^the\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
