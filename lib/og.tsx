/**
 * Shared design for social share images (the preview card you see when a
 * link is posted to iMessage, LinkedIn, X, Slack, GroupMe…).
 *
 * Each page's opengraph-image.tsx calls shareImage() with its own text.
 * Images are 1200×630, generated at build time by Next.js (next/og).
 */
import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site, siteInitials } from "./site";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

// Fonts are read once, when the module loads.
// Font files live in assets/fonts (Fraunces and Inter, both open-source, SIL OFL).
const fontDir = path.join(process.cwd(), "assets", "fonts");
const fraunces = fs.readFileSync(path.join(fontDir, "fraunces-latin-600-normal.woff"));
const inter = fs.readFileSync(path.join(fontDir, "inter-latin-400-normal.woff"));
const interBold = fs.readFileSync(path.join(fontDir, "inter-latin-600-normal.woff"));

const fonts = [
  { name: "Fraunces", data: fraunces, weight: 600 as const, style: "normal" as const },
  { name: "Inter", data: inter, weight: 400 as const, style: "normal" as const },
  { name: "Inter", data: interBold, weight: 600 as const, style: "normal" as const },
];

/**
 * The logo monogram (same design as components/Logo.tsx), drawn with
 * plain boxes so next/og can render it to PNG at any size.
 */
export function Monogram({ px, rounded = true }: { px: number; rounded?: boolean }) {
  const initials = siteInitials();
  const u = px / 64; // design is on a 64-unit grid
  return (
    <div
      style={{
        width: px,
        height: px,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#012169",
        borderRadius: rounded ? 14 * u : 0,
        border: rounded ? `${1.5 * u}px solid rgba(185,217,235,0.35)` : "none",
      }}
    >
      <div
        style={{
          fontFamily: "Fraunces",
          color: "#ffffff",
          fontSize: (initials.length > 1 ? 26 : 34) * u,
          lineHeight: 1,
          marginTop: 4 * u,
        }}
      >
        {initials}
      </div>
      <div style={{ width: 32 * u, height: 1.6 * u, backgroundColor: "#B9D9EB", marginTop: 6 * u, borderRadius: u }} />
      <div style={{ width: 32 * u, height: 1.6 * u, backgroundColor: "rgba(185,217,235,0.55)", marginTop: 2.9 * u, borderRadius: u }} />
    </div>
  );
}

/** Square app icon (favicon, home-screen icon) */
export function iconImage(px: number) {
  return new ImageResponse(<Monogram px={px} rounded={false} />, { width: px, height: px, fonts });
}

export function shareImage({
  eyebrow,
  title,
  subtitle,
  meta,
}: {
  eyebrow: string; // small light-blue tag, e.g. "Variant View"
  title: string; // big serif headline
  subtitle?: string;
  meta?: string; // bottom-right, e.g. a date
}) {
  // Shrink the headline a bit if it's long so it always fits
  const titleSize = title.length > 70 ? 56 : title.length > 45 ? 66 : 78;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#012169",
          padding: "64px 72px",
          fontFamily: "Inter",
          color: "#ffffff",
        }}
      >
        {/* Top: wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Monogram px={64} />
          <div style={{ fontFamily: "Fraunces", fontSize: 38 }}>{site.name}</div>
        </div>

        {/* Middle: tag + headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              backgroundColor: "#B9D9EB",
              color: "#012169",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              padding: "8px 18px",
              borderRadius: 999,
            }}
          >
            {eyebrow}
          </div>
          <div style={{ fontFamily: "Fraunces", fontSize: titleSize, lineHeight: 1.05, maxWidth: 1050 }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: 28, lineHeight: 1.35, color: "#B9D9EB", maxWidth: 1000 }}>
              {subtitle.length > 140 ? `${subtitle.slice(0, 137)}…` : subtitle}
            </div>
          )}
        </div>

        {/* Bottom: affiliation + meta, over a thin light-blue rule */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(185,217,235,0.35)",
            paddingTop: 22,
            fontSize: 22,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          <div>{site.footer.shortAffiliation}</div>
          {meta && <div style={{ color: "#B9D9EB", fontWeight: 600 }}>{meta}</div>}
        </div>
      </div>
    ),
    { ...ogSize, fonts },
  );
}
