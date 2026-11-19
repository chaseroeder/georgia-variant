import { ogContentType, ogSize, shareImage } from "@/lib/og";
import { site } from "@/lib/site";

// Default share image for every page that doesn't have its own
export const alt = `${site.name}: ${site.tagline}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return shareImage({
    eyebrow: "Weekly markets newsletter",
    title: site.tagline,
    subtitle: "Market moves, macro, a weekly contrarian stock pick, and Emory alumni in finance.",
  });
}
