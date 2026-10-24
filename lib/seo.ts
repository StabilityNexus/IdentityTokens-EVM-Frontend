import type { Metadata } from "next";

/** Production origin, matching `public/CNAME`. No trailing slash. */
export const SITE_URL = "https://dit.stability.nexus";

export const SITE_NAME = "Decentralized Identity Token";

/**
 * GitHub Pages project sites live under /<repo>, which Next exposes as
 * basePath. Absolute URLs (canonicals, sitemap, OG tags) have to carry it;
 * `next/link` hrefs do not, because the router adds it automatically.
 */
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

/** Absolute URL for a site path, including basePath when one is configured. */
export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  // The root is canonically https://host (no trailing slash), matching how
  // Next serializes metadata URLs. Sub-paths never carry a trailing slash.
  if (normalized === "/") return `${SITE_URL}${BASE_PATH}`;
  return `${SITE_URL}${BASE_PATH}${normalized}`;
}

export const OG_IMAGE = {
  url: absoluteUrl("/og.jpg"),
  width: 1200,
  height: 630,
  alt: "DIT launch video still with the text: Mint your identity today at dit.stability.nexus",
  type: "image/jpeg",
};

type PageMetadataOptions = {
  title: string;
  description: string;
  /** Route path used for the canonical URL, e.g. "/claim". */
  path: string;
  /** Set when the title should not get the root layout's "%s | ..." suffix. */
  absoluteTitle?: boolean;
};

/**
 * Shared per-page metadata. Every field is repeated here (rather than relying
 * on object merging with the root layout) because Next replaces nested
 * metadata objects such as `openGraph` instead of deep-merging them.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Stability Nexus DIT",
      locale: "en_US",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
