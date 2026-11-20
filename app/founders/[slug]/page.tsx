import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/ArticleSkeleton";
import { Avatar } from "@/components/Avatar";
import { Mdx } from "@/components/Mdx";
import { SampleBadge, SectionTag } from "@/components/ui";
import { getAlumni, getAlumnus } from "@/lib/content";
import { formatShortDate } from "@/lib/format";

/**
 * One alumni profile: /founders/onu-okebie-brian-boland
 * The slug is the file name in content/alumni/.
 */

export function generateStaticParams() {
  return getAlumni().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/founders/[slug]">): Promise<Metadata> {
  const a = getAlumnus((await params).slug);
  if (!a) return {};
  return { title: `${a.name}: Emory Founders Center`, description: a.headline };
}

// The URL-dependent part streams in inside <Suspense> (see variant-view/[slug]/page.tsx)
export default function AlumnusPage({ params }: PageProps<"/founders/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton narrow />}>
      <AlumnusContent params={params} />
    </Suspense>
  );
}

async function AlumnusContent({ params }: { params: PageProps<"/founders/[slug]">["params"] }) {
  const a = getAlumnus((await params).slug);
  if (!a) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
      <Link href="/founders" className="text-sm font-medium text-ink-muted hover:text-ink-strong">
        ← All alumni
      </Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <SectionTag>{a.industry}</SectionTag>
          {a.placeholder && <SampleBadge label="Template" />}
        </div>

        <h1
          className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {a.headline}
        </h1>

        <div className="mt-8 flex items-center gap-5 border-y border-rule py-5">
          <Avatar name={a.name} photo={a.photo} size={72} />
          <div className="min-w-0">
            <div className="font-serif text-xl font-semibold text-ink-strong">{a.name}</div>
            <div className="text-ink">
              {a.role}, {a.firm}
            </div>
            <div className="num mt-0.5 text-sm text-ink-muted">
              {a.school} ’{String(a.classYear).slice(-2)}
              {a.location && <> · {a.location}</>}
            </div>
          </div>
        </div>
      </header>

      {a.coverPhoto && (
        <figure className="mt-8">
          <Image
            src={a.coverPhoto}
            alt={a.coverCaption ?? `Photo of ${a.name}`}
            width={1200}
            height={800}
            sizes="(min-width: 768px) 720px, 100vw"
            className="h-auto w-full rounded-2xl border border-rule object-cover"
            priority
          />
          {a.coverCaption && <figcaption className="mt-2 text-sm text-ink-muted">{a.coverCaption}</figcaption>}
        </figure>
      )}

      <div className="mt-10">
        <Mdx source={a.body} />
      </div>

      {/* Advice callout (only when there's a real quote) */}
      {a.advice && (
      <aside className="band-alt mt-12 rounded-2xl border-l-4 border-navy p-6 sm:p-8 dark:border-light-blue">
        <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Advice for Emory students</h2>
        <p className="mt-3 font-serif text-xl leading-snug text-ink-strong sm:text-2xl">“{a.advice}”</p>
      </aside>
      )}

      {a.links.length > 0 && (
        <ul className="mt-8 flex flex-wrap gap-2">
          {a.links.map((l) => (
            <li key={l.url}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-4 py-2 text-sm font-medium text-ink-strong shadow-card transition-colors hover:border-navy/40 dark:hover:border-light-blue/40"
              >
                {l.label}
                <span aria-hidden="true">↗</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-xs text-ink-muted">Published {formatShortDate(a.published)}</p>
    </article>
  );
}
