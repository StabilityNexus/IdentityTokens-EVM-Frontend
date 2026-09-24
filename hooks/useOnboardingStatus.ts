"use client";

import { useAccount } from "wagmi";
import { useRootId } from "./useIdentityReads";

/** Whether the connected wallet still has to go through /onboarding. */
// Lighter than `useIdentityGate`, which also reads profile/tokens and writes the store.
export function useOnboardingStatus() {
  const { address, isConnected } = useAccount();
  const {
    data: rootId,
    isSuccess,
    isLoading,
    error,
    refetch: refetchRootId,
  } = useRootId(address);

  const hasRootIdentity = !!rootId && rootId > 0n;

  return {
    address,
    isConnected,
    hasRootIdentity,
    rootId: rootId ?? null,

    /** The read has answered, or failed and never will — safe to redirect. */
    isResolved: isConnected && (isSuccess || !!error),

    /** False on error: a flaky RPC must never prompt a second root identity. */
    needsOnboarding: isConnected && isSuccess && !hasRootIdentity,

    isLoading,
    error,
    refetchRootId,
  };
}
