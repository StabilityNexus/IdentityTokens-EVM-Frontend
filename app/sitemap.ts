import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// Required for metadata routes under `output: "export"`.
export const dynamic = "force-static";

/**
 * Only publicly useful pages belong here. /dashboard, /discover, /home,
 * /settings, /wallet, /profile, and /onboarding are wallet-gated and marked
 * noindex, so listing them would send crawlers to pages excluded from search.
 *
 * There are no dynamic path segments to enumerate: profiles use `?u=` query
 * strings and are rendered from on-chain reads in the browser, so they cannot
 * be captured as static HTML in this export.
 */
// No lastModified: the build time would mark every page as changed on every
// deploy, which teaches crawlers to ignore it. Google ignores changeFrequency
// and priority.
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/claim", "/privacy-policy"].map((path) => ({
    url: absoluteUrl(path),
  }));
}
