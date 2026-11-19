/**
 * The "current" issue shown on the home page, Market Pulse, and Macro Desk.
 *
 * It's the newest file in content/issues/ (drafts count only in dev).
 * If there are no issue files at all, we fall back to sample copy so the
 * site still renders.
 */
import { getIssues, type Issue } from "./content";
import { mockIssue } from "./mockData";

export type { Issue };

export async function getTodayIssue(): Promise<Issue> {
  const latest = getIssues()[0];
  if (latest) return latest;

  return {
    slug: "sample",
    date: "2026-11-18",
    headline: mockIssue.headline,
    dek: mockIssue.dek,
    editorsTake: mockIssue.editorsTake,
    movers: mockIssue.movers,
    macroCommentary: mockIssue.macroCommentary,
    author: "The Georgia Variant",
    draft: false,
    sample: true,
    body: "",
  };
}
