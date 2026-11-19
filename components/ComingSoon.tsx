import Link from "next/link";
import { SectionTag } from "./ui";

/**
 * Temporary page body for sections we haven't built yet, so the nav
 * never leads to a 404. Each one gets replaced in a later phase.
 */
export function ComingSoon({ title, phase, blurb }: { title: string; phase: number; blurb: string }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <SectionTag>Coming in phase {phase}</SectionTag>
      <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">{blurb}</p>
      <Link href="/" className="mt-8 inline-block text-sm font-semibold text-ink-strong underline-offset-4 hover:underline">
        ← Back to today&rsquo;s issue
      </Link>
    </section>
  );
}
