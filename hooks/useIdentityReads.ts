"use client";

import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import {
  IDENTITY_SYSTEM_ADDRESS,
  IDENTITY_SYSTEM_ABI,
  PROFILE_SYSTEM_ADDRESS,
  PROFILE_SYSTEM_ABI,
} from "@/lib/contracts";
import { TOKEN_TYPE } from "@/lib/types";
import { tokenIdFor } from "@/lib/tokenId";
import { validateUsername } from "@/lib/validation";

// IdentitySystem Reads

/** Get the root identity ID for a wallet address */
export function useRootId(
  address: `0x${string}` | undefined,
  chainId?: number
) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "ownerToRootId",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: !!address },
  });
}

/** Get the full root identity view for a root ID */
export function useRootIdentityView(
  rootId: bigint | undefined,
  chainId?: number
) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "getRootIdentityView",
    args: rootId ? [rootId] : undefined,
    chainId,
    query: { enabled: !!rootId && rootId > 0n },
  });
}

/** Get all token IDs owned by a wallet */
export function useWalletTokens(address: `0x${string}` | undefined) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "getWalletTokens",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

/** Get full token data for a specific token ID */
export function useTokenDetail(tokenId: bigint | undefined) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "tokens",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: { enabled: tokenId !== undefined },
  });
}

/** Get all token IDs under a root identity */
export function useTokensForRoot(rootId: bigint | undefined) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "getTokensForRoot",
    args: rootId ? [rootId] : undefined,
    query: { enabled: !!rootId && rootId > 0n },
  });
}

/** Get active attestation count for a token */
export function useActiveAttestationCount(tokenId: bigint | undefined) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "getActiveAttestationCount",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: { enabled: tokenId !== undefined },
  });
}

/**
 * Who attested a token, each attester already resolved to a display name and
 * profile token id.
 *
 * `activeOnly` filters out revoked and expired attestations; paging applies to
 * the filtered set, so `total` is the filtered count.
 */
export function useAttestersDetailed(
  tokenId: bigint | undefined,
  activeOnly: boolean,
  offset = 0n,
  limit = 50n
) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "getAttestersDetailed",
    args:
      tokenId !== undefined ? [tokenId, activeOnly, offset, limit] : undefined,
    query: { enabled: tokenId !== undefined },
  });
}

/** Get the PROFILE token id held by a wallet, or 0n if it holds none */
export function useProfileTokenId(address: `0x${string}` | undefined) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "getProfileTokenId",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

/** Get transfer history for a token */
export function useTransferHistory(tokenId: bigint | undefined) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "getTransferHistory",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: { enabled: tokenId !== undefined },
  });
}

/** Check if an attester has actively attested a token */
export function useHasAttested(
  attesterRootId: bigint | undefined,
  tokenId: bigint | undefined
) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "hasAttested",
    args:
      attesterRootId !== undefined && tokenId !== undefined
        ? [attesterRootId, tokenId]
        : undefined,
    query: {
      enabled: attesterRootId !== undefined && tokenId !== undefined,
    },
  });
}

/** Check if a wallet has a profile token (on IdentitySystem) */
export function useHasProfile(address: `0x${string}` | undefined) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "hasProfile",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

/** Get the owner of a specific token */
export function useTokenOwner(tokenId: bigint | undefined) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "ownerOf",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: { enabled: tokenId !== undefined },
  });
}

// ProfileSystem Reads

/** Check if a wallet has minted a profile (on ProfileSystem) */
export function useHasMintedProfile(address: `0x${string}` | undefined) {
  return useReadContract({
    address: PROFILE_SYSTEM_ADDRESS,
    abi: PROFILE_SYSTEM_ABI,
    functionName: "hasMintedProfile",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

/** Get profile metadata for a profile token ID */
export function useProfile(tokenId: bigint | undefined) {
  return useReadContract({
    address: PROFILE_SYSTEM_ADDRESS,
    abi: PROFILE_SYSTEM_ABI,
    functionName: "getProfile",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: { enabled: tokenId !== undefined },
  });
}

/** Get the custom-link slots of a profile (an empty url marks a free slot) */
export function useProfileLinks(tokenId: bigint | undefined) {
  return useReadContract({
    address: PROFILE_SYSTEM_ADDRESS,
    abi: PROFILE_SYSTEM_ABI,
    functionName: "getLinks",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: { enabled: tokenId !== undefined },
  });
}

/** Check if a username is already taken */
export function useUsernameTaken(
  username: string | undefined,
  chainId?: number
) {
  return useReadContract({
    address: PROFILE_SYSTEM_ADDRESS,
    abi: PROFILE_SYSTEM_ABI,
    functionName: "usernameTaken",
    args: username ? [username] : undefined,
    chainId,
    query: { enabled: !!username && username.length >= 3 },
  });
}

/** Resolve a username to a profile token ID via on-chain mapping */
export function useResolveUsername(username: string | undefined) {
  // Usernames can't contain "-", so token ids like "pf-…" never reach this
  const isValidUsername =
    !!username && validateUsername(username).status === "valid";

  return useReadContract({
    address: PROFILE_SYSTEM_ADDRESS,
    abi: PROFILE_SYSTEM_ABI,
    functionName: "usernameToProfileTokenId",
    args: isValidUsername ? [username] : undefined,
    query: { enabled: isValidUsername },
  });
}

// Batch Reads (Multicall)

/** Batch-fetch token details for multiple token IDs in a single multicall */
export function useMultipleTokenDetails(
  tokenIds: readonly bigint[] | undefined
) {
  const contracts = (tokenIds ?? []).map((id) => ({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "tokens" as const,
    args: [id] as const,
  }));

  return useReadContracts({
    contracts,
    query: { enabled: !!tokenIds && tokenIds.length > 0 },
  });
}

/** Batch-fetch attestation counts for multiple token IDs */
export function useMultipleAttestationCounts(
  tokenIds: readonly bigint[] | undefined
) {
  const contracts = (tokenIds ?? []).map((id) => ({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "getActiveAttestationCount" as const,
    args: [id] as const,
  }));

  return useReadContracts({
    contracts,
    query: { enabled: !!tokenIds && tokenIds.length > 0 },
  });
}

/** Batch-fetch token owners for multiple token IDs */
export function useMultipleTokenOwners(
  tokenIds: readonly bigint[] | undefined
) {
  const contracts = (tokenIds ?? []).map((id) => ({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "ownerOf" as const,
    args: [id] as const,
  }));

  return useReadContracts({
    contracts,
    query: { enabled: !!tokenIds && tokenIds.length > 0 },
  });
}

const RECENT_TYPES = [TOKEN_TYPE.SUB, TOKEN_TYPE.PROFILE] as const;
const RECENT_PER_TYPE = 20n;

// Newest ids per type from the minted counters; burned ids included, callers drop them
export function useRecentTokens() {
  const { data: counts, isLoading } = useReadContracts({
    contracts: RECENT_TYPES.map((type) => ({
      address: IDENTITY_SYSTEM_ADDRESS,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "minted" as const,
      args: [BigInt(type)] as const,
    })),
  });

  const tokenIds = useMemo(() => {
    const ids: bigint[] = [];
    RECENT_TYPES.forEach((type, i) => {
      const result = counts?.[i];
      const minted = result?.status === "success" ? result.result : 0n;
      for (
        let serial = minted;
        serial > 0n && serial > minted - RECENT_PER_TYPE;
        serial--
      ) {
        ids.push(tokenIdFor(type, serial));
      }
    });
    return ids;
  }, [counts]);

  return { data: tokenIds, isLoading };
}
