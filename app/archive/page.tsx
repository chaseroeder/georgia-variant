import type { Metadata } from "next";
import { ArchiveList, type IssueSummary } from "@/components/ArchiveList";
import { PageHeader } from "@/components/PageHeader";
import { getIssues } from "@/lib/content";

export const metadata: Metadata = {
  title: "Archive",
  description: "Every past issue of the newsletter, searchable by topic, ticker, or date.",
};

export default function ArchivePage() {
  // Send only what the list and search need to the browser
  const issues: IssueSummary[] = getIssues().map((i) => ({
    date: i.date,
    headline: i.headline,
    dek: i.dek,
    tickers: i.movers.map((m) => m.symbol),
    searchText: [i.editorsTake, i.macroCommentary, ...i.movers.map((m) => m.note), i.body].join(" "),
    draft: i.draft,
    sample: i.sample,
  }));

  return (
    <>
      <PageHeader
        tag="Archive"
        title="Every issue"
        dek="Search past issues by topic, ticker, or date. Try “Fed”, “TGT”, or “November”."
      />
      <section className="mx-auto mt-10 max-w-4xl px-4 sm:px-6">
        <ArchiveList issues={issues} />
      </section>
    </>
  );
}
