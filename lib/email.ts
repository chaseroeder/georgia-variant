/**
 * Everything email: Resend setup, and turning today's issue into an email.
 *
 * Settings (all in .env.local, see .env.example):
 *   RESEND_API_KEY     your Resend API key
 *   RESEND_SEGMENT_ID  the Resend "segment" (subscriber list) to add people to and send to
 *   EMAIL_FROM         "The Georgia Variant <newsletter@yourdomain.com>" (domain must be verified in Resend)
 *   EMAIL_REPLY_TO     optional reply-to address
 */
import { render } from "@react-email/render";
import { Resend } from "resend";
import DailyIssueEmail, { type DailyIssueEmailProps, type EmailQuote } from "@/emails/DailyIssue";
import WelcomeEmail from "@/emails/Welcome";
import { getAlumni, getVariantPicks } from "./content";
import { direction, formatBp, formatIssueDate, formatPct, formatPrice, formatShortDate } from "./format";
import { getTodayIssue } from "./issue";
import { getMacroSnapshot } from "./macroData";
import { getSectorPerformance, getTickerQuotes, getTopMovers } from "./marketData";
import { site, siteInitials } from "./site";

/* ───────────── Resend setup ───────────── */

export function emailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY ?? "",
    segmentId: process.env.RESEND_SEGMENT_ID ?? "",
    from: process.env.EMAIL_FROM ?? "",
    replyTo: process.env.EMAIL_REPLY_TO || undefined,
  };
}

/** Which required settings are missing (empty array = ready to send) */
export function missingEmailSettings(): string[] {
  const c = emailConfig();
  return [
    !c.apiKey && "RESEND_API_KEY",
    !c.segmentId && "RESEND_SEGMENT_ID",
    !c.from && "EMAIL_FROM",
  ].filter(Boolean) as string[];
}

export function getResend(): Resend {
  const { apiKey } = emailConfig();
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  return new Resend(apiKey);
}

/* ───────────── Build today's issue email ───────────── */

export interface BuiltEmail {
  issueDate: string;
  subject: string;
  previewText: string;
  html: string;
  text: string;
  isSampleData: boolean;
  isDraft: boolean;
}

/**
 * Gathers today's issue + live market data and renders the email.
 * `unsubscribeUrl` defaults to Resend's placeholder, which Resend swaps
 * for each subscriber's personal link when it sends a broadcast.
 */
export async function buildIssueEmail(unsubscribeUrl = "{{{RESEND_UNSUBSCRIBE_URL}}}"): Promise<BuiltEmail> {
  const [issue, ticker, movers, sectors, macro] = await Promise.all([
    getTodayIssue(),
    getTickerQuotes(),
    getTopMovers(),
    getSectorPerformance(),
    getMacroSnapshot(),
  ]);
  const pick = getVariantPicks()[0];
  const alum = getAlumni()[0];
  const m = macro.data;

  // Format the market strip: S&P, Nasdaq, Dow, 10Y
  const strip: EmailQuote[] = ticker.data
    .filter((q) => ["SPX", "NDX", "DJI", "US10Y"].includes(q.symbol))
    .map((q) =>
      q.kind === "yield"
        ? { name: q.name, value: `${q.price.toFixed(2)}%`, change: formatBp(q.change), direction: direction(q.change) }
        : { name: q.name, value: formatPrice(q.price), change: formatPct(q.changePct), direction: direction(q.changePct) },
    );

  const allMovers = [...movers.data.gainers, ...movers.data.losers];
  const sorted = [...sectors.data].sort((a, b) => b.changePct - a.changePct);

  const props: DailyIssueEmailProps = {
    siteName: site.name,
    siteUrl: site.url,
    initials: siteInitials(),
    dateLabel: formatIssueDate(new Date(`${issue.date}T12:00:00Z`)),
    issueUrl: `${site.url}/archive/${issue.date}`,
    headline: issue.headline,
    dek: issue.dek,
    editorsTake: issue.editorsTake,
    markets: strip,
    movers: issue.movers.map((mv) => {
      const q = allMovers.find((x) => x.symbol === mv.symbol);
      return { ...mv, change: q ? formatPct(q.changePct) : undefined, direction: q ? direction(q.changePct) : undefined };
    }),
    gainers: movers.data.gainers.map((g) => ({ symbol: g.symbol, name: g.name, change: formatPct(g.changePct) })),
    losers: movers.data.losers.map((g) => ({ symbol: g.symbol, name: g.name, change: formatPct(g.changePct) })),
    sectorsBest: sorted.slice(0, 3).map((s) => ({ name: s.name, change: formatPct(s.changePct) })),
    sectorsWorst: sorted.slice(-3).reverse().map((s) => ({ name: s.name, change: formatPct(s.changePct) })),
    macroStats: [
      { label: "2Y", value: `${m.y2.value.toFixed(2)}%` },
      { label: "10Y", value: `${m.y10.value.toFixed(2)}%` },
      { label: "Fed funds", value: `${m.fedFunds.value.toFixed(2)}%` },
      { label: "Next FOMC", value: m.nextFomc ? formatShortDate(m.nextFomc).replace(/, \d{4}$/, "") : "TBA" },
    ],
    macroCommentary: issue.macroCommentary,
    variantView: pick && {
      ticker: pick.ticker,
      company: pick.company,
      headline: pick.headline,
      url: `${site.url}/variant-view/${pick.slug}`,
    },
    founder: alum && {
      name: alum.name,
      detail: `${alum.name} ’${String(alum.classYear).slice(-2)} · ${alum.role}, ${alum.firm}`,
      headline: alum.headline,
      url: `${site.url}/founders/${alum.slug}`,
    },
    isSampleData: ticker.isSample || movers.isSample || sectors.isSample || macro.isSample,
    disclaimer: site.footer.disclaimer,
    affiliation: site.footer.affiliation,
    postalAddress: site.email.postalAddress,
    unsubscribeUrl,
  };

  const element = DailyIssueEmail(props);
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);

  return {
    issueDate: issue.date,
    subject: `${site.name}: ${issue.headline}`,
    previewText: issue.dek,
    html,
    text,
    isSampleData: props.isSampleData,
    isDraft: issue.draft || issue.slug === "sample",
  };
}

/* ───────────── Welcome email ───────────── */

export async function buildWelcomeEmail() {
  const element = WelcomeEmail({
    siteName: site.name,
    siteUrl: site.url,
    initials: siteInitials(),
    disclaimer: site.footer.disclaimer,
  });
  return {
    subject: `Welcome to ${site.name}`,
    html: await render(element),
    text: await render(element, { plainText: true }),
  };
}
