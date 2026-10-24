import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// Required for metadata routes under `output: "export"`.
export const dynamic = "force-static";

/**
 * GitHub Pages has no header-level controls, so robots.txt plus per-page meta
 * tags are the only indexing controls. App routes carry `noindex` in their
 * layouts; everything is crawlable so those tags can be seen.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
