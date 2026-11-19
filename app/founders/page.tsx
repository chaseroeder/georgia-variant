import type { Metadata } from "next";
import { FoundersDirectory, type AlumnusSummary } from "@/components/FoundersDirectory";
import { PageHeader } from "@/components/PageHeader";
import { getAlumni, INDUSTRIES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Emory Founders Center",
  description: "Profiles of Emory alumni in finance and startups: banking, private equity, hedge funds, venture, startups, and quant.",
};

export default function FoundersPage() {
  // Send only the summary fields to the browser, not the full interviews
  const alumni: AlumnusSummary[] = getAlumni().map((a) => ({
    slug: a.slug,
    name: a.name,
    classYear: a.classYear,
    school: a.school,
    role: a.role,
    firm: a.firm,
    industry: a.industry,
    location: a.location,
    photo: a.photo,
    headline: a.headline,
    placeholder: a.placeholder,
  }));

  return (
    <>
      <PageHeader
        tag="Emory Founders Center"
        title="Emory alumni doing interesting things"
        dek="Conversations with Emory grads in banking, private equity, hedge funds, venture, startups, and quant: how they got there, and what they'd tell you now."
      />
      <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
        <FoundersDirectory alumni={alumni} industries={INDUSTRIES} />
      </section>
    </>
  );
}
