"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { hasAcceptedTerms } from "@/lib/onboarding";

// /discover is left out: browsing other people's tokens needs no identity.
const GATED_ROUTES = ["/dashboard", "/home"];

/** Sends a connected wallet with no root identity to /onboarding. */
export function OnboardingGate() {
  const router = useRouter();
  const pathname = usePathname();
  const { address, needsOnboarding } = useOnboardingStatus();

  useEffect(() => {
    if (!needsOnboarding) return;
    if (!pathname || !GATED_ROUTES.includes(pathname)) return;

    // Just registered here: an RPC lagging a block must not bounce them back.
    if (hasAcceptedTerms(address)) return;

    router.replace("/onboarding");
  }, [address, needsOnboarding, pathname, router]);

  return null;
}

export default OnboardingGate;
