"use client";

import { useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { useAppStore } from "@/store/useAppStore";
import {
  useRootId,
  useRootIdentityView,
  useHasProfile,
  useWalletTokens,
  useMultipleTokenTypes,
  useProfile,
} from "./useIdentityReads";

/**
 * Identity gate hook — orchestrates identity state on wallet connect.
 *
 * Flow:
 * 1. Get connected address from wagmi
 * 2. Fetch ownerToRootId(address) → root ID
 * 3. If rootId > 0, fetch getRootIdentityView → populate zustand
 * 4. Check hasProfile(address) → populate profile status
 * 5. Batch-fetch token types for all wallet tokens
 * 6. Find the PROFILE token (type === 2) and fetch its metadata
 *
 * Returns everything components need to render identity-aware UI.
 */
export function useIdentityGate() {
  const { address, isConnected } = useAccount();
  const store = useAppStore();

  // Step 1: Get root ID
  const {
    data: rootId,
    isLoading: isRootIdLoading,
    refetch: refetchRootId,
  } = useRootId(address);

  // Step 2: Get root identity view (only if rootId > 0)
  const { data: rootView, isLoading: isRootViewLoading } = useRootIdentityView(
    rootId && rootId > 0n ? rootId : undefined,
  );

  // Step 3: Check profile status
  const {
    data: hasProfile,
    isLoading: isProfileLoading,
    refetch: refetchHasProfile,
  } = useHasProfile(address);

  // Step 4: Get wallet tokens
  const {
    data: walletTokenIds,
    isLoading: isTokensLoading,
    refetch: refetchWalletTokens,
  } = useWalletTokens(address);

  // Step 5: Batch-fetch token types for all wallet tokens
  const { data: tokenTypesData, isLoading: isTypesLoading } =
    useMultipleTokenTypes(walletTokenIds);

  // Step 6: Find the PROFILE token (type === 2) among wallet tokens
  const profileTokenId = useMemo(() => {
    if (!walletTokenIds || !tokenTypesData) return undefined;

    for (let i = 0; i < walletTokenIds.length; i++) {
      const typeResult = tokenTypesData[i];
      if (typeResult?.status === "success" && typeResult.result === 2) {
        return walletTokenIds[i];
      }
    }
    return undefined;
  }, [walletTokenIds, tokenTypesData]);

  // Step 7: Get profile data if we have a profile token
  const { data: profileData, isLoading: isProfileDataLoading } =
    useProfile(profileTokenId);

  // Sync to zustand store
  useEffect(() => {
    if (!isConnected || !address) {
      store.clearAll();
      return;
    }

    // Set root identity
    if (rootId && rootId > 0n && rootView) {
      store.setRootIdentity(rootId, rootView.displayName);
    }

    // Set profile status
    if (hasProfile !== undefined) {
      store.setHasProfile(!!hasProfile);
    }

    // Set profile data
    if (profileTokenId && profileData) {
      store.setProfile(profileTokenId, {
        name: profileData.name,
        username: profileData.username,
        age: profileData.age,
        nationality: profileData.nationality,
        github: profileData.github,
        email: profileData.email,
        discord: profileData.discord,
        xDotCom: profileData.xDotCom,
        websitePortfolioLink: profileData.websitePortfolioLink,
        ens: profileData.ens,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, rootId, rootView, hasProfile, profileTokenId, profileData]);

  const isLoading =
    isRootIdLoading ||
    isRootViewLoading ||
    isProfileLoading ||
    isTokensLoading ||
    isTypesLoading ||
    isProfileDataLoading;

  return {
    // Connection
    isConnected,
    address,

    // Root Identity
    hasRootIdentity: !!rootId && rootId > 0n,
    rootId: rootId ?? null,
    displayName: rootView?.displayName ?? null,

    // Profile
    hasProfile: !!hasProfile,
    profileTokenId: profileTokenId ?? null,
    profileData: profileData ?? null,

    // Tokens
    walletTokenIds: walletTokenIds ?? [],

    // Loading
    isLoading,

    // Refetchers (for invalidation after writes)
    refetchRootId,
    refetchHasProfile,
    refetchWalletTokens,
  };
}
