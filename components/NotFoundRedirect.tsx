"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAddress } from "viem";

/**
 * Resolves the app's two "pretty" single-segment URLs.
 *
 * A static export cannot pre-render a route per username or per wallet, so
 * `/<username>` and `/<wallet_address>` are both served the 404 page by the
 * host and re-pointed here at the route that can actually render them.
 *
 * Addresses are matched leniently (`strict: false`): the EVM treats an address
 * as case-insensitive and the checksum is only a typo guard, so a link that
 * got lowercased in transit must still reach the wallet view rather than fall
 * through to a username lookup that cannot possibly match.
 */
export function NotFoundRedirect() {
  const router = useRouter();

  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;

    const knownRoutes = [
      "/",
      "/home",
      "/dashboard",
      "/discover",
      "/settings",
      "/profile",
      "/wallet",
    ];

    const normalized = path.replace(/\/$/, "") || "/";

    if (knownRoutes.includes(normalized)) {
      return;
    }

    const segments = normalized.split("/").filter(Boolean);
    if (segments.length !== 1) {
      return;
    }

    const segment = segments[0];

    // Use Next.js router for a clean soft navigation
    if (isAddress(segment, { strict: false })) {
      router.replace(`/wallet?u=${segment}${hash}`);
      return;
    }

    router.replace(`/profile?u=${encodeURIComponent(segment)}${hash}`);
  }, [router]);

  return null;
}
