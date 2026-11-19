"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";

/**
 * Shown if something on a page crashes. The header and footer still
 * render, and readers can try again without reloading the whole site.
 */
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error); // shows up in Vercel's logs
  }, [error]);

  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-4xl font-semibold sm:text-5xl">Something went wrong</h1>
      <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-ink-muted">
        This page hit an error while loading. It&rsquo;s probably temporary.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-card dark:bg-light-blue dark:text-navy"
        >
          Try again
        </button>
        <Link href="/" className="rounded-full border border-rule px-5 py-2.5 text-sm font-semibold text-ink-strong">
          Go to today&rsquo;s issue
        </Link>
      </div>
    </section>
  );
}
