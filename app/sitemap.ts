import type { MetadataRoute } from "next";
import { getAlumni, getIssues, getVariantPicks } from "@/lib/content";
import { site } from "@/lib/site";

/**
 * /sitemap.xml: tells Google which pages exist. Rebuilt on every deploy,
 * so new issues, picks, and profiles are included automatically.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${site.url}${path}`;
  const issues = getIssues().filter((i) => !i.draft);

  return [
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    { url: url("/market-pulse"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/macro"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/variant-view"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/founders"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/archive"), changeFrequency: "daily", priority: 0.7 },
    { url: url("/about"), changeFrequency: "monthly", priority: 0.5 },
    ...issues.map((i) => ({ url: url(`/archive/${i.date}`), lastModified: i.date, priority: 0.6 })),
    ...getVariantPicks().map((p) => ({ url: url(`/variant-view/${p.slug}`), lastModified: p.published, priority: 0.7 })),
    ...getAlumni().map((a) => ({ url: url(`/founders/${a.slug}`), lastModified: a.published, priority: 0.6 })),
  ];
}
