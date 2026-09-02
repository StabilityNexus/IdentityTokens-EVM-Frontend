"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
    ];

    const normalized = path.replace(/\/$/, "") || "/";

    if (knownRoutes.includes(normalized)) {
      return;
    }

    const segments = normalized.split("/").filter(Boolean);
    if (segments.length === 1) {
      const username = segments[0];
      // Use Next.js router for a clean soft navigation
      router.replace(`/profile?u=${encodeURIComponent(username)}${hash}`);
    }
  }, [router]);

  return null;
}
