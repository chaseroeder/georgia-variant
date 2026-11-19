import { getIssue } from "@/lib/content";
import { formatShortDate } from "@/lib/format";
import { ogContentType, ogSize, shareImage } from "@/lib/og";

export const alt = "Weekly letter";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ date: string }> }) {
  const issue = getIssue((await params).date);
  return shareImage({
    eyebrow: "Weekly letter",
    title: issue?.headline ?? "Weekly letter",
    subtitle: issue?.dek,
    meta: issue ? formatShortDate(issue.date) : undefined,
  });
}
