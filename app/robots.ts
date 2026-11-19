import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** /robots.txt: let search engines crawl everything except the API routes. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
