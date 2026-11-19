import { getIssue } from "@/lib/content";
import { formatShortDate } from "@/lib/format";
import { ogContentType, ogSize, shareImage } from "@/lib/og";

export const alt = "Daily issue";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ date: string }> }) {
  const issue = getIssue((await params).date);
  return shareImage({
    eyebrow: "Daily issue",
    title: issue?.headline ?? "Daily issue",
    subtitle: issue?.dek,
    meta: issue ? formatShortDate(issue.date) : undefined,
  });
}
