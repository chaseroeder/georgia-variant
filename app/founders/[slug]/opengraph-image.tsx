import { getAlumnus } from "@/lib/content";
import { ogContentType, ogSize, shareImage } from "@/lib/og";

export const alt = "Emory Founders Center profile";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const a = getAlumnus((await params).slug);
  return shareImage({
    eyebrow: "Emory Founders Center",
    title: a?.headline ?? "Emory alumni in finance and startups",
    subtitle: a ? `${a.name} ’${String(a.classYear).slice(-2)} · ${a.role}, ${a.firm}` : undefined,
  });
}
