"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { isAddress } from "viem";
import { validateUsername } from "@/lib/validation";

const KNOWN_ROUTES = [
  "/",
  "/home",
  "/dashboard",
  "/discover",
  "/settings",
  "/profile",
  "/wallet",
];

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const HARD_NAV_FALLBACK_MS = 700;

/** The path is read once per render, so there is nothing to subscribe to. */
const NO_SUBSCRIPTION = () => () => {};

const ASSET_EXTENSION =
  /\.(?:ico|png|jpe?g|gif|svg|webp|avif|txt|xml|json|map|css|js|webmanifest|woff2?)$/i;

function withQuery(route: string, u: string, search: string, hash: string) {
  const params = new URLSearchParams(search);

  params.set("u", u);
  return `${route}?${params.toString()}${hash}`;
}

function resolveTarget(
  pathname: string,
  search: string,
  hash: string
): string | null {
  const rooted =
    BASE_PATH && pathname.startsWith(BASE_PATH)
      ? pathname.slice(BASE_PATH.length)
      : pathname;

  const normalized = rooted.replace(/\/$/, "") || "/";
  if (KNOWN_ROUTES.includes(normalized)) return null;

  const segments = normalized.split("/").filter(Boolean);
  if (segments.length !== 1) return null;

  const segment = segments[0];
  if (ASSET_EXTENSION.test(segment)) return null;

  if (isAddress(segment, { strict: false })) {
    return withQuery("/wallet", segment, search, hash);
  }

  if (/^0x/i.test(segment)) {
    return withQuery("/wallet", segment, search, hash);
  }

  if (/^\d+$/.test(segment)) {
    return withQuery("/profile", segment, search, hash);
  }

  if (validateUsername(segment).status !== "valid") return null;

  return withQuery("/profile", segment, search, hash);
}

/**
 * Resolves the app's two "pretty" single-segment URLs.
 *
 * A static export cannot pre-render a route per username or per wallet, so
 * `/<username>` and `/<wallet_address>` are both served the 404 page by the
 * host and re-pointed here at the route that can actually render them.
 *
 * Addresses are matched leniently (`strict: false`): the EVM treats an address
 * as case-insensitive and the checksum is only a typo guard, so a link that got
 * lowercased in transit must still reach the wallet view rather than fall
 * through to a username lookup that cannot possibly match.
 */
export function NotFoundRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // `undefined` until the client can read the URL: the 404 shell is
  // prerendered without knowing which path it will be served for, and reading
  // that through a store keeps the hydration render matching the server's.
  const target = useSyncExternalStore<string | null | undefined>(
    NO_SUBSCRIPTION,
    () =>
      resolveTarget(
        window.location.pathname,
        window.location.search,
        window.location.hash
      ),
    () => undefined
  );

  useEffect(() => {
    if (!target) return;

    router.replace(target);

    // `next dev` renders this page outside the router's own tree, where
    // `router.replace` never commits. A navigation that does land unmounts
    // this component and clears the timer, so only the one that went nowhere
    // falls back to a reload.
    const fallback = setTimeout(() => {
      window.location.replace(`${BASE_PATH}${target}`);
    }, HARD_NAV_FALLBACK_MS);

    return () => clearTimeout(fallback);
  }, [router, target]);

  if (target !== null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-landing-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
