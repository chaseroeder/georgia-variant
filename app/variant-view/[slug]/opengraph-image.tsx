import { getVariantPick } from "@/lib/content";
import { formatShortDate } from "@/lib/format";
import { ogContentType, ogSize, shareImage } from "@/lib/og";

export const alt = "Variant View stock pick";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const pick = getVariantPick((await params).slug);
  return shareImage({
    eyebrow: pick ? `Variant View · ${pick.stance}` : "Variant View",
    title: pick ? `${pick.company} (${pick.ticker})` : "Variant View",
    subtitle: pick?.headline,
    meta: pick ? formatShortDate(pick.published) : undefined,
  });
}
