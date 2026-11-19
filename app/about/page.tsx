import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { PageHeader, PageSection } from "@/components/PageHeader";
import { SubscribeForm } from "@/components/SubscribeForm";
import { Card } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About & Subscribe",
  description: `${site.description} Subscribe free.`,
};

/** What readers get in each issue (links to each section) */
const SECTIONS = [
  { href: "/market-pulse", title: "Market Pulse", cadence: "Daily", body: "Index moves, the biggest gainers and losers, a sector heatmap, and one line on why the notable names moved." },
  { href: "/macro", title: "Macro Desk", cadence: "Daily", body: "Treasury yields and the curve, the Fed, inflation, jobs, and growth, explained without the jargon." },
  { href: "/variant-view", title: "Variant View", cadence: "Weekly", body: "One stock where we disagree with Wall Street, what would prove us wrong, and a public scorecard." },
  { href: "/founders", title: "Emory Founders Center", cadence: "Weekly", body: "Conversations with Emory alumni in banking, PE, hedge funds, venture, startups, and quant." },
];

export default function AboutPage() {
  const teamSize: number = site.about.team.length;
  return (
    <>
      <PageHeader tag="About" title={`Why ${site.name} exists`} dek={site.about.mission} />

      {/* Subscribe */}
      <section id="subscribe" className="mx-auto mt-10 max-w-6xl scroll-mt-20 px-4 sm:px-6">
        <div className="rounded-3xl bg-navy p-6 text-white shadow-card sm:p-10 dark:border dark:border-white/10 dark:bg-navy-deep">
          <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-center">
            <div>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Get it before the bell</h2>
              <p className="mt-3 text-white/80">
                One email, every weekday morning. Five minutes, no jargon, free.
              </p>
            </div>
            <SubscribeForm tone="navy" />
          </div>
        </div>
      </section>

      <PageSection title="What's in every issue">
        <div className="grid gap-3 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <Card key={s.href} href={s.href}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{s.cadence}</span>
              </div>
              <p className="mt-2 leading-relaxed text-ink">{s.body}</p>
            </Card>
          ))}
        </div>
      </PageSection>

      <PageSection title="The team">
        {/* Columns adapt to team size: 2 people fill one row; 3+ spread out */}
        <ul
          className={`grid gap-3 sm:grid-cols-2 ${
            teamSize <= 2 ? "max-w-3xl" : teamSize === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
          }`}
        >
          {site.about.team.map((m, i) => (
            <li key={`${m.name}-${i}`} className="flex items-center gap-4 rounded-2xl border border-rule bg-surface p-4 shadow-card">
              <Avatar name={m.name} size={48} />
              <div className="min-w-0">
                <div className="truncate font-serif text-lg font-semibold text-ink-strong">{m.name}</div>
                <div className="truncate text-sm text-ink">{m.role}</div>
                <div className="num truncate text-xs text-ink-muted">{m.school}</div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-muted">
          Want to write for us? We&rsquo;re always looking for students who like markets. Reply to any issue.
        </p>
      </PageSection>

      <PageSection title="The fine print">
        <div className="max-w-3xl space-y-3 leading-relaxed text-ink">
          <p>
            <strong className="text-ink-strong">{site.footer.disclaimer}</strong> Everything we publish is student research and
            opinion for learning purposes. Nothing here is a recommendation to buy or sell any security. Writers may own the stocks
            they write about.
          </p>
          <p>
            Market data can be delayed or occasionally wrong. Check a primary source before relying on any number. See the{" "}
            <Link href="/variant-view#scorecard" className="font-semibold text-ink-strong underline underline-offset-4">
              Variant View scorecard
            </Link>{" "}
            for how our picks have actually done.
          </p>
        </div>
      </PageSection>
    </>
  );
}
