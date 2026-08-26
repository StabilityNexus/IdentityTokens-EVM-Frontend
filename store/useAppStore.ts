import { create } from "zustand";
import type { ProfileMetadata } from "@/lib/contracts";

interface AppState {
  // Root Identity (auto-created, transparent to user)
  rootId: bigint | null;
  displayName: string | null;
  hasRootIdentity: boolean;

  // Profile
  hasProfile: boolean;
  profileTokenId: bigint | null;
  profileData: ProfileMetadata | null;

  // Loading
  isLoading: boolean;

  // Actions
  setRootIdentity: (rootId: bigint, displayName: string) => void;
  setProfile: (tokenId: bigint, data: ProfileMetadata) => void;
  setHasProfile: (has: boolean) => void;
  clearAll: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  rootId: null,
  displayName: null,
  hasRootIdentity: false,

  hasProfile: false,
  profileTokenId: null,
  profileData: null,

  isLoading: false,

  // Actions
  setRootIdentity: (rootId, displayName) =>
    set({
      rootId,
      displayName,
      hasRootIdentity: true,
    }),

  setProfile: (tokenId, data) =>
    set({
      profileTokenId: tokenId,
      profileData: data,
      hasProfile: true,
    }),

  setHasProfile: (has) =>
    set({
      hasProfile: has,
      ...(has ? {} : { profileTokenId: null, profileData: null }),
    }),

  clearAll: () =>
    set({
      rootId: null,
      displayName: null,
      hasRootIdentity: false,
      hasProfile: false,
      profileTokenId: null,
      profileData: null,
      isLoading: false,
    }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
