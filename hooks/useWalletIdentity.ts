"use client";

import {
  useProfile,
  useProfileTokenId,
  useRootId,
  useRootIdentityView,
  useWalletTokens,
} from "./useIdentityReads";

// Stable reference so consumers can use the result as a hook dependency
// without re-running on every render.
const NO_TOKENS: readonly bigint[] = [];

/**
 * Everything the app knows about an arbitrary wallet, read-only.
 *
 * `useIdentityGate` answers the same questions for the *connected* wallet and
 * syncs the answers into the zustand store; pointing it at someone else would
 * overwrite the viewer's own identity. This reads the same contracts for a
 * given address and writes nothing.
 */
export function useWalletIdentity(address: `0x${string}` | undefined) {
  const {
    data: rootId,
    isLoading: isRootIdLoading,
    error: rootIdError,
  } = useRootId(address);

  const {
    data: rootView,
    isLoading: isRootViewLoading,
    error: rootViewError,
  } = useRootIdentityView(rootId && rootId > 0n ? rootId : undefined);

  const {
    data: walletTokenIds,
    isLoading: isTokensLoading,
    error: walletTokensError,
  } = useWalletTokens(address);

  const {
    data: rawProfileTokenId,
    isLoading: isProfileTokenIdLoading,
    error: profileTokenIdError,
  } = useProfileTokenId(address);

  // The contract returns 0 when the wallet holds no profile.
  const profileTokenId =
    rawProfileTokenId && rawProfileTokenId > 0n ? rawProfileTokenId : undefined;

  const {
    data: profileData,
    isLoading: isProfileDataLoading,
    error: profileDataError,
  } = useProfile(profileTokenId);

  // Surface the first error rather than folding it into `isLoading`, or a
  // failed read leaves the page spinning forever with nothing explaining why.
  const error =
    rootIdError ??
    rootViewError ??
    walletTokensError ??
    profileTokenIdError ??
    profileDataError ??
    null;

  const isLoading =
    !error &&
    !!address &&
    (isRootIdLoading ||
      isRootViewLoading ||
      isTokensLoading ||
      isProfileTokenIdLoading ||
      isProfileDataLoading);

  return {
    address,

    // Root Identity
    hasRootIdentity: !!rootId && rootId > 0n,
    rootId: rootId ?? null,
    displayName: rootView?.displayName ?? null,

    // Profile
    hasProfile: !!profileTokenId,
    profileTokenId: profileTokenId ?? null,
    profileData: profileData ?? null,

    // Tokens
    walletTokenIds: walletTokenIds ?? NO_TOKENS,

    isLoading,
    error,
  };
}
