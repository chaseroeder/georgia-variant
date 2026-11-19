import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** Lets phones "Add to Home Screen" with the right name, icon, and colors. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name.replace(/^The /, ""),
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#012169",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
