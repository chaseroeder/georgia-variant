/**
 * The daily newsletter email, built with React Email.
 *
 * Email is NOT the web: Gmail, Outlook, and Apple Mail ignore most modern
 * CSS. React Email's components (<Section>, <Row>, <Column>…) turn into
 * old-school HTML tables with inline styles, which every inbox renders.
 *
 * Design mirrors the site: navy header with the logo, white body,
 * light-blue section labels, green/red only for gains and losses.
 *
 * This component only displays data it's given. lib/emailIssue.ts
 * gathers the data (issue file + market APIs) and renders it.
 */
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,

  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";
import { EmailLogo } from "./EmailLogo";

/* ───────────── Data the template needs ───────────── */

export interface EmailQuote {
  name: string;
  value: string; // already formatted, e.g. "6,912.40" or "4.12%"
  change: string; // e.g. "+0.42%" or "+3 bp"
  direction: -1 | 0 | 1;
}

export interface DailyIssueEmailProps {
  siteName: string;
  siteUrl: string;
  initials: string; // logo monogram letters
  dateLabel: string; // "Wednesday, November 18, 2026"
  issueUrl: string;
  headline: string;
  dek: string;
  editorsTake: string;
  markets: EmailQuote[];
  movers: { symbol: string; note: string; change?: string; direction?: -1 | 0 | 1 }[];
  gainers: { symbol: string; name: string; change: string }[];
  losers: { symbol: string; name: string; change: string }[];
  sectorsBest: { name: string; change: string }[];
  sectorsWorst: { name: string; change: string }[];
  macroStats: { label: string; value: string }[];
  macroCommentary: string;
  variantView?: { ticker: string; company: string; headline: string; url: string };
  founder?: { name: string; detail: string; headline: string; url: string };
  isSampleData: boolean;
  disclaimer: string;
  affiliation: string;
  postalAddress: string;
  /** Resend replaces {{{RESEND_UNSUBSCRIBE_URL}}} with each reader's personal link */
  unsubscribeUrl: string;
}

/* ───────────── Brand colors & type (inline styles only) ───────────── */

const navy = "#012169";
const lightBlue = "#B9D9EB";
const paleBlue = "#EEF5FB";
const slate = "#1F2937";
const muted = "#5B6472"; // a touch darker than the site's #6B7280 for small email text
const green = "#0F7B4A";
const red = "#B42318";
const rule = "#DCE4EF";

const serif = "Fraunces, Georgia, 'Times New Roman', serif";
const sans = "Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const num: CSSProperties = { fontVariantNumeric: "tabular-nums" };

const colorFor = (d?: -1 | 0 | 1) => (d === 1 ? green : d === -1 ? red : muted);

/* ───────────── Template ───────────── */

export default function DailyIssueEmail(p: DailyIssueEmailProps) {
  return (
    <Html lang="en">
      <Head>
        {/* Clients that support web fonts (Apple Mail, iOS) get Fraunces/Inter; others fall back.
            The lint rule below is for web pages; this is an email, so it doesn't apply. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <meta name="color-scheme" content="light only" />
      </Head>
      {/* Inbox preview line (shown after the subject in most email apps) */}
      <Preview>{p.dek}</Preview>

      <Body style={{ backgroundColor: paleBlue, margin: 0, padding: "24px 0", fontFamily: sans }}>
        <Container style={{ maxWidth: 600, width: "100%", backgroundColor: "#ffffff", borderRadius: 12, overflow: "hidden" }}>
          {/* ── Navy header with logo ── */}
          <Section style={{ backgroundColor: navy, padding: "24px 28px" }}>
            <Row>
              <Column style={{ width: 44, verticalAlign: "middle" }}>
                <EmailLogo initials={p.initials} />
              </Column>
              <Column style={{ verticalAlign: "middle", paddingLeft: 12 }}>
                <Text style={{ margin: 0, fontFamily: serif, fontSize: 24, fontWeight: 600, color: "#ffffff", lineHeight: "28px" }}>
                  {p.siteName}
                </Text>
                <Text style={{ margin: "2px 0 0", fontSize: 12, color: lightBlue, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {p.dateLabel}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* ── Market strip ── */}
          <Section style={{ backgroundColor: navy, padding: "0 28px 20px" }}>
            <Row>
              {p.markets.slice(0, 4).map((q) => (
                <Column key={q.name} style={{ width: "25%", verticalAlign: "top" }}>
                  <Text style={{ margin: 0, fontSize: 11, color: lightBlue }}>{q.name}</Text>
                  <Text style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 600, color: "#ffffff", ...num }}>{q.value}</Text>
                  <Text style={{ margin: 0, fontSize: 12, fontWeight: 600, ...num, color: q.direction === 1 ? "#6EE7A8" : q.direction === -1 ? "#FCA5A5" : lightBlue }}>
                    {q.change}
                  </Text>
                </Column>
              ))}
            </Row>
          </Section>

          {/* ── Lead ── */}
          <Section style={{ padding: "28px 28px 8px" }}>
            <Heading as="h1" style={{ margin: 0, fontFamily: serif, fontSize: 30, lineHeight: "34px", fontWeight: 600, color: navy }}>
              {p.headline}
            </Heading>
            <Text style={{ margin: "12px 0 0", fontSize: 16, lineHeight: "24px", color: muted }}>{p.dek}</Text>
          </Section>

          <Block label="Editor’s take">
            <Text style={{ margin: 0, padding: "4px 0 4px 14px", borderLeft: `3px solid ${navy}`, fontFamily: serif, fontSize: 18, lineHeight: "26px", color: navy }}>
              {p.editorsTake}
            </Text>
          </Block>

          {/* ── Market Pulse ── */}
          <Block label="Market Pulse" href={`${p.siteUrl}/market-pulse`}>
            <Row>
              <Column style={{ width: "50%", verticalAlign: "top", paddingRight: 8 }}>
                <SmallHead>Top gainers</SmallHead>
                {p.gainers.slice(0, 3).map((g) => (
                  <ListRow key={g.symbol} left={<b>{g.symbol}</b>} right={g.change} color={green} />
                ))}
              </Column>
              <Column style={{ width: "50%", verticalAlign: "top", paddingLeft: 8 }}>
                <SmallHead>Top losers</SmallHead>
                {p.losers.slice(0, 3).map((g) => (
                  <ListRow key={g.symbol} left={<b>{g.symbol}</b>} right={g.change} color={red} />
                ))}
              </Column>
            </Row>

            {p.movers.length > 0 && (
              <>
                <SmallHead style={{ marginTop: 18 }}>Why it moved</SmallHead>
                {p.movers.map((m, i) => (
                  <Text key={`${m.symbol}-${i}`} style={{ margin: "0 0 8px", fontSize: 14, lineHeight: "21px", color: slate }}>
                    <b style={{ color: navy, ...num }}>{m.symbol}</b>
                    {m.change && <span style={{ color: colorFor(m.direction), fontWeight: 600, ...num }}> {m.change}</span>}
                    {" · "}
                    {m.note}
                  </Text>
                ))}
              </>
            )}

            <SmallHead style={{ marginTop: 18 }}>Sectors</SmallHead>
            <Text style={{ margin: 0, fontSize: 14, lineHeight: "21px", color: slate }}>
              <span style={{ color: muted }}>Leaders: </span>
              {p.sectorsBest.map((s, i) => (
                <span key={s.name}>
                  {i > 0 && ", "}
                  {s.name} <span style={{ color: green, fontWeight: 600, ...num }}>{s.change}</span>
                </span>
              ))}
              <br />
              <span style={{ color: muted }}>Laggards: </span>
              {p.sectorsWorst.map((s, i) => (
                <span key={s.name}>
                  {i > 0 && ", "}
                  {s.name} <span style={{ color: red, fontWeight: 600, ...num }}>{s.change}</span>
                </span>
              ))}
            </Text>
          </Block>

          {/* ── Macro Desk ── */}
          <Block label="Macro Desk" href={`${p.siteUrl}/macro`}>
            <Row>
              {p.macroStats.slice(0, 4).map((s) => (
                <Column key={s.label} style={{ width: "25%", verticalAlign: "top" }}>
                  <Text style={{ margin: 0, fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</Text>
                  <Text style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 600, color: navy, ...num }}>{s.value}</Text>
                </Column>
              ))}
            </Row>
            <Text style={{ margin: "14px 0 0", fontSize: 14, lineHeight: "21px", color: slate }}>{p.macroCommentary}</Text>
          </Block>

          {/* ── Variant View ── */}
          {p.variantView && (
            <Block label="Variant View" href={p.variantView.url}>
              <Text style={{ margin: 0, fontFamily: serif, fontSize: 19, fontWeight: 600, color: navy }}>
                {p.variantView.company} <span style={{ fontFamily: sans, fontSize: 13, color: muted, ...num }}>({p.variantView.ticker})</span>
              </Text>
              <Text style={{ margin: "6px 0 0", fontSize: 15, lineHeight: "22px", color: slate }}>{p.variantView.headline}</Text>
              <CtaLink href={p.variantView.url}>Read the thesis</CtaLink>
            </Block>
          )}

          {/* ── Founders Center ── */}
          {p.founder && (
            <Section style={{ padding: "8px 28px 0" }}>
              <Section style={{ backgroundColor: paleBlue, borderRadius: 10, padding: "18px 20px" }}>
                <Label>Emory Founders Center</Label>
                <Text style={{ margin: "8px 0 0", fontFamily: serif, fontSize: 18, lineHeight: "24px", fontWeight: 600, color: navy }}>
                  {p.founder.headline}
                </Text>
                <Text style={{ margin: "4px 0 0", fontSize: 13, color: muted }}>{p.founder.detail}</Text>
                <CtaLink href={p.founder.url}>Read the profile</CtaLink>
              </Section>
            </Section>
          )}

          {/* ── Read online ── */}
          <Section style={{ padding: "28px 28px 8px", textAlign: "center" }}>
            <Link
              href={p.issueUrl}
              style={{ display: "inline-block", backgroundColor: navy, color: "#ffffff", fontSize: 14, fontWeight: 600, padding: "12px 22px", borderRadius: 999, textDecoration: "none" }}
            >
              Read this issue online
            </Link>
          </Section>

          {/* ── Footer ── */}
          <Section style={{ padding: "20px 28px 28px" }}>
            <Hr style={{ borderColor: rule, margin: "0 0 16px" }} />
            {p.isSampleData && (
              <Text style={{ margin: "0 0 8px", fontSize: 12, color: "#92400E" }}>
                Note: some market numbers in this email are sample data.
              </Text>
            )}
            <Text style={{ margin: 0, fontSize: 12, lineHeight: "18px", color: muted }}>
              <b style={{ color: navy }}>{p.disclaimer}</b> {p.affiliation}
            </Text>
            {p.postalAddress && <Text style={{ margin: "6px 0 0", fontSize: 12, color: muted }}>{p.postalAddress}</Text>}
            <Text style={{ margin: "10px 0 0", fontSize: 12, color: muted }}>
              <Link href={p.siteUrl} style={{ color: navy }}>
                {p.siteName}
              </Link>
              {" · "}
              <Link href={p.unsubscribeUrl} style={{ color: muted }}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ───────────── Small building blocks ───────────── */

function Label({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        backgroundColor: lightBlue,
        color: navy,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "4px 10px",
        borderRadius: 999,
      }}
    >
      {children}
    </span>
  );
}

function Block({ label, href, children }: { label: string; href?: string; children: ReactNode }) {
  return (
    <Section style={{ padding: "20px 28px 4px" }}>
      <Hr style={{ borderColor: rule, margin: "0 0 18px" }} />
      <Row>
        <Column>
          <Label>{label}</Label>
        </Column>
        {href && (
          <Column style={{ textAlign: "right" }}>
            <Link href={href} style={{ fontSize: 12, color: navy, fontWeight: 600 }}>
              More →
            </Link>
          </Column>
        )}
      </Row>
      <Section style={{ paddingTop: 12 }}>{children}</Section>
    </Section>
  );
}

function SmallHead({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <Text style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", ...style }}>
      {children}
    </Text>
  );
}

function ListRow({ left, right, color }: { left: ReactNode; right: string; color: string }) {
  return (
    <Row style={{ borderBottom: `1px solid ${rule}` }}>
      <Column style={{ padding: "6px 0", fontSize: 14, color: navy, ...num }}>{left}</Column>
      <Column style={{ padding: "6px 0", fontSize: 14, color, fontWeight: 600, textAlign: "right", ...num }}>{right}</Column>
    </Row>
  );
}

function CtaLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} style={{ display: "inline-block", marginTop: 10, fontSize: 14, fontWeight: 600, color: navy }}>
      {children} →
    </Link>
  );
}
