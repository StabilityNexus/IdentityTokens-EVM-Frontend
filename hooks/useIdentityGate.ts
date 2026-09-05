"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAccount } from "wagmi";
import { useAppStore } from "@/store/useAppStore";
import { TOKEN_TYPE } from "@/lib/types";
import {
  useRootId,
  useRootIdentityView,
  useHasProfile,
  useWalletTokens,
  useMultipleTokenTypes,
  useProfile,
} from "./useIdentityReads";

export function useIdentityGate() {
  const { address, isConnected } = useAccount();
  const store = useAppStore();

  // Step 1: Get root ID
  const {
    data: rootId,
    isLoading: isRootIdLoading,
    error: rootIdError,
    refetch: refetchRootId,
  } = useRootId(address);

  // Step 2: Get root identity view (only if rootId > 0)
  const {
    data: rootView,
    isLoading: isRootViewLoading,
    error: rootViewError,
  } = useRootIdentityView(rootId && rootId > 0n ? rootId : undefined);

  // Step 3: Check profile status
  const {
    data: hasProfile,
    isLoading: isProfileLoading,
    error: hasProfileError,
    refetch: refetchHasProfile,
  } = useHasProfile(address);

  // Step 4: Get wallet tokens
  const {
    data: walletTokenIds,
    isLoading: isTokensLoading,
    error: walletTokensError,
    refetch: refetchWalletTokens,
  } = useWalletTokens(address);

  // Step 5: Batch-fetch token types for all wallet tokens
  const {
    data: tokenTypesData,
    isLoading: isTypesLoading,
    error: tokenTypesError,
  } = useMultipleTokenTypes(walletTokenIds);

  // Step 6: Find the PROFILE token (type === 2) among wallet tokens
  const profileTokenId = useMemo(() => {
    if (!walletTokenIds || !tokenTypesData) return undefined;

    for (let i = 0; i < walletTokenIds.length; i++) {
      const typeResult = tokenTypesData[i];
      if (
        typeResult?.status === "success" &&
        typeResult.result === TOKEN_TYPE.PROFILE
      ) {
        return walletTokenIds[i];
      }
    }
    return undefined;
  }, [walletTokenIds, tokenTypesData]);

  // Step 7: Get profile data if we have a profile token
  const {
    data: profileData,
    isLoading: isProfileDataLoading,
    error: profileDataError,
  } = useProfile(profileTokenId);

  // Sync to zustand store
  const lastSyncedAddress = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isConnected || !address) {
      lastSyncedAddress.current = undefined;
      store.clearAll();
      return;
    }

    // Switching accounts must not leave the previous wallet's identity in the
    // store. The setters below only fire once the new account's reads resolve,
    // and there is no "clear root" path, so an account with no root identity
    // would otherwise keep showing the previous account's rootId/displayName.
    if (lastSyncedAddress.current !== address) {
      lastSyncedAddress.current = address;
      store.clearAll();
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
  }, [
    isConnected,
    address,
    rootId,
    rootView,
    hasProfile,
    profileTokenId,
    profileData,
  ]);

  // A read that has failed will keep retrying and refetching on focus, so
  // folding its pending state into `isLoading` leaves every consumer stuck on a
  // spinner forever with nothing on screen explaining why. Surface the first
  // error instead and let callers render it.
  const error =
    rootIdError ??
    rootViewError ??
    hasProfileError ??
    walletTokensError ??
    tokenTypesError ??
    profileDataError ??
    null;

  const isLoading =
    !error &&
    (isRootIdLoading ||
      isRootViewLoading ||
      isProfileLoading ||
      isTokensLoading ||
      isTypesLoading ||
      isProfileDataLoading);

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
    error,

    // Refetchers (for invalidation after writes)
    refetchRootId,
    refetchHasProfile,
    refetchWalletTokens,
  };
}
