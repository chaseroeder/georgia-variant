import type { ReactNode } from "react";
import { SampleBadge, SectionTag } from "./ui";

/** Title block at the top of each section page */
export function PageHeader({
  tag,
  title,
  dek,
  isSample = false,
  meta,
}: {
  tag: string;
  title: string;
  dek?: string;
  isSample?: boolean;
  meta?: ReactNode;
}) {
  return (
    <header className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <div className="flex flex-wrap items-center gap-3">
        <SectionTag>{tag}</SectionTag>
        {isSample && <SampleBadge />}
        {meta && <span className="text-xs text-ink-muted">{meta}</span>}
      </div>
      <h1
        className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-5xl"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {title}
      </h1>
      {dek && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">{dek}</p>}
    </header>
  );
}

/** A titled section within a page, separated by a thin rule */
export function PageSection({
  id,
  title,
  aside,
  children,
}: {
  id?: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className="mx-auto max-w-6xl scroll-mt-16 px-4 sm:px-6">
      <div className="mt-12 flex items-end justify-between gap-4 border-t border-rule pt-6">
        <h2 id={id ? `${id}-title` : undefined} className="text-2xl font-semibold sm:text-3xl">
          {title}
        </h2>
        {aside && <div className="text-xs text-ink-muted">{aside}</div>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
