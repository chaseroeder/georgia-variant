/**
 * Loads editorial content from the /content folder.
 *
 * Each .mdx file has two parts:
 *   1. Frontmatter: the YAML block between the `---` lines (structured fields)
 *   2. Body: regular Markdown/MDX below it (the article text)
 *
 * Frontmatter is checked against a schema (zod). If a required field is
 * missing or the wrong type, the build fails with a message naming the
 * file and field, instead of quietly rendering a broken page.
 *
 * We read files synchronously on purpose: content only changes when you
 * edit a file, so Next.js can treat it as static and prerender each page.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const CONTENT_DIR = path.join(process.cwd(), "content");

/* ───────────── Shared helpers ───────────── */

/** YAML turns 2026-11-16 into a Date; we want the plain "YYYY-MM-DD" string */
const isoDate = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD"),
);

/** Read every .mdx file in a folder (skipping _template.mdx etc.), validate it, and return it */
function loadFolder<T extends z.ZodType>(folder: string, schema: T) {
  const dir = path.join(CONTENT_DIR, folder);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        const problems = parsed.error.issues
          .map((i) => `  • ${i.path.join(".") || "(file)"}: ${i.message}`)
          .join("\n");
        throw new Error(`Problem in content/${folder}/${file}:\n${problems}`);
      }
      return { ...(parsed.data as z.infer<T> & object), slug: file.replace(/\.mdx$/, ""), body: content };
    });
}

/* ───────────── Variant View ───────────── */

const variantSchema = z.object({
  ticker: z.string().min(1).transform((s) => s.toUpperCase()),
  company: z.string().min(1),
  published: isoDate,
  priceAtPublication: z.number().positive(),
  author: z.string().default("The Georgia Variant"),
  headline: z.string().min(1),
  /** "Long" = we think it goes up more than consensus thinks; "Short" = down */
  stance: z.enum(["Long", "Short"]).default("Long"),
  consensus: z.string().min(1),
  variantView: z.string().min(1),
  thesis: z.array(z.string()).min(3, "need 3–5 thesis points").max(5, "need 3–5 thesis points"),
  catalysts: z.array(z.string()).min(1),
  risks: z.array(z.string()).min(1),
  /** Set true on example files so the page shows a "Sample" label */
  sample: z.boolean().default(false),
});

export type VariantPick = z.infer<typeof variantSchema> & { slug: string; body: string };

/** All picks, newest first */
export function getVariantPicks(): VariantPick[] {
  return loadFolder("variant-view", variantSchema).sort((a, b) => b.published.localeCompare(a.published));
}

export function getVariantPick(slug: string): VariantPick | undefined {
  return getVariantPicks().find((p) => p.slug === slug);
}

/* ───────────── Founders Center (alumni) ───────────── */

export const INDUSTRIES = ["Investment Banking", "Private Equity", "Hedge Funds", "Venture Capital", "Startups", "Quant"] as const;
export type Industry = (typeof INDUSTRIES)[number];

const alumniSchema = z.object({
  name: z.string().min(1),
  classYear: z.number().int().min(1900).max(2100),
  school: z.string().min(1), // e.g. "Goizueta Business School", "Emory College"
  role: z.string().min(1),
  firm: z.string().min(1),
  industry: z.enum(INDUSTRIES, { message: `industry must be one of: ${INDUSTRIES.join(", ")}` }),
  location: z.string().optional(),
  /** Path under /public, e.g. /alumni/jane-doe.jpg. Leave out for an initials avatar. */
  photo: z.string().optional(),
  headline: z.string().min(1),
  advice: z.string().min(1),
  links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
  published: isoDate,
  /** Set true on template files so the page shows a "Template" label */
  placeholder: z.boolean().default(false),
});

export type Alumnus = z.infer<typeof alumniSchema> & { slug: string; body: string };

/** All alumni, most recently published first */
export function getAlumni(): Alumnus[] {
  return loadFolder("alumni", alumniSchema).sort((a, b) => b.published.localeCompare(a.published));
}

export function getAlumnus(slug: string): Alumnus | undefined {
  return getAlumni().find((a) => a.slug === slug);
}

/* ───────────── Daily issues ───────────── */

/*
 * One file per trading day: content/issues/YYYY-MM-DD.mdx
 * The file name IS the issue date. Frontmatter holds the written parts;
 * market numbers are filled in live from the APIs on the site.
 */
const issueSchema = z.object({
  headline: z.string().min(1),
  /** One- or two-sentence summary under the headline */
  dek: z.string().min(1),
  editorsTake: z.string().min(1),
  /** Notable movers with a one-line "why it moved" */
  movers: z
    .array(
      z.object({
        symbol: z.string().min(1).transform((s) => s.toUpperCase()),
        note: z.string().min(1),
      }),
    )
    .default([]),
  macroCommentary: z.string().min(1),
  author: z.string().default("The Georgia Variant"),
  /** Drafts show up while you run `npm run dev`, but are hidden on the live site */
  draft: z.boolean().default(false),
  /** Set true on example files so the page shows a "Sample" label */
  sample: z.boolean().default(false),
});

export type Issue = z.infer<typeof issueSchema> & { slug: string; date: string; body: string };

/** All published issues, newest first. Drafts are included only in development. */
export function getIssues(): Issue[] {
  const showDrafts = process.env.NODE_ENV !== "production";
  return loadFolder("issues", issueSchema)
    .map((i) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(i.slug)) {
        throw new Error(`content/issues/${i.slug}.mdx: issue files must be named YYYY-MM-DD.mdx`);
      }
      return { ...i, date: i.slug };
    })
    .filter((i) => showDrafts || !i.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getIssue(date: string): Issue | undefined {
  return getIssues().find((i) => i.date === date);
}
