import Link from "next/link";
import { SectionTag } from "@/components/ui";

/** Shown for any URL that doesn't exist (404) */
export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <SectionTag>404</SectionTag>
      <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">This page went to zero</h1>
      <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-ink-muted">
        We couldn&rsquo;t find what you were looking for. It may have moved, or the link may be mistyped.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-card dark:bg-light-blue dark:text-navy">
          Today&rsquo;s issue
        </Link>
        <Link href="/archive" className="rounded-full border border-rule px-5 py-2.5 text-sm font-semibold text-ink-strong">
          Search the archive
        </Link>
      </div>
    </section>
  );
}
