"use client";

import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import {
  IDENTITY_SYSTEM_ADDRESS,
  IDENTITY_SYSTEM_ABI,
  PROFILE_SYSTEM_ADDRESS,
  PROFILE_SYSTEM_ABI,
} from "@/lib/contracts";

// IdentitySystem Reads

/** Get the root identity ID for a wallet address */
export function useRootId(address: `0x${string}` | undefined) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "ownerToRootId",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

/** Get the full root identity view for a root ID */
export function useRootIdentityView(rootId: bigint | undefined) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "getRootIdentityView",
    args: rootId ? [rootId] : undefined,
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

/** Get the token type (ROOT=0, SUB=1, PROFILE=2) */
export function useTokenType(tokenId: bigint | undefined) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "tokenTypes",
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

/** Get active endorsements for a token */
export function useActiveEndorsements(tokenId: bigint | undefined) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "getActiveEndorsements",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: { enabled: tokenId !== undefined },
  });
}

/** Get active endorsement count for a token */
export function useActiveEndorsementCount(tokenId: bigint | undefined) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "getActiveEndorsementCount",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: { enabled: tokenId !== undefined },
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

/** Check if an endorser has actively endorsed a token */
export function useHasEndorsed(
  endorserRootId: bigint | undefined,
  tokenId: bigint | undefined,
) {
  return useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "hasEndorsed",
    args:
      endorserRootId !== undefined && tokenId !== undefined
        ? [endorserRootId, tokenId]
        : undefined,
    query: {
      enabled: endorserRootId !== undefined && tokenId !== undefined,
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

/** Check if a username is already taken */
export function useUsernameTaken(username: string | undefined) {
  return useReadContract({
    address: PROFILE_SYSTEM_ADDRESS,
    abi: PROFILE_SYSTEM_ABI,
    functionName: "usernameTaken",
    args: username ? [username] : undefined,
    query: { enabled: !!username && username.length >= 3 },
  });
}

/** Resolve a username to a profile token ID via on-chain mapping */
export function useResolveUsername(username: string | undefined) {
  // Only attempt resolution for valid username strings (not numeric IDs)
  const isValidUsername = !!username && username.length >= 3 && !/^\d+$/.test(username);

  return useReadContract({
    address: PROFILE_SYSTEM_ADDRESS,
    abi: PROFILE_SYSTEM_ABI,
    functionName: "usernameToProfileTokenId",
    args: isValidUsername ? [username] : undefined,
    query: { enabled: isValidUsername },
  });
}

// Batch Reads (Multicall)

/** Batch-fetch token types for multiple token IDs in a single multicall */
export function useMultipleTokenTypes(tokenIds: readonly bigint[] | undefined) {
  const contracts = (tokenIds ?? []).map((id) => ({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "tokenTypes" as const,
    args: [id] as const,
  }));

  return useReadContracts({
    contracts,
    query: { enabled: !!tokenIds && tokenIds.length > 0 },
  });
}

/** Batch-fetch token details for multiple token IDs in a single multicall */
export function useMultipleTokenDetails(tokenIds: readonly bigint[] | undefined) {
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

/** Batch-fetch endorsement counts for multiple token IDs */
export function useMultipleEndorsementCounts(tokenIds: readonly bigint[] | undefined) {
  const contracts = (tokenIds ?? []).map((id) => ({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "getActiveEndorsementCount" as const,
    args: [id] as const,
  }));

  return useReadContracts({
    contracts,
    query: { enabled: !!tokenIds && tokenIds.length > 0 },
  });
}

/** Batch-fetch token owners for multiple token IDs */
export function useMultipleTokenOwners(tokenIds: readonly bigint[] | undefined) {
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




export function useRecentTokens() {
  // Generate IDs 1 to 100
  const maxTokensToCheck = 100;
  const tokenIds = useMemo(() => {
    return Array.from({ length: maxTokensToCheck }, (_, i) => BigInt(i + 1));
  }, []);

  // Batch fetch their types
  const { data: tokenTypes, isLoading } = useMultipleTokenTypes(tokenIds);

  const recentEvents = useMemo(() => {
    if (!tokenTypes) return [];

    const validTokens: { tokenId: bigint, tokenType: string }[] = [];

    for (let i = 0; i < tokenTypes.length; i++) {
      const typeResult = tokenTypes[i];
      if (typeResult?.status === "success") {
        const typeNum = typeResult.result as number;

        let typeStr = "UNKNOWN";
        if (typeNum === 0) typeStr = "ROOT";
        else if (typeNum === 1) typeStr = "SUB";
        else if (typeNum === 2) typeStr = "PROFILE";

        if (typeNum > 0 && typeStr !== "UNKNOWN") {
          validTokens.push({
            tokenId: BigInt(i + 1),
            tokenType: typeStr
          });
        }
      }
    }

    // Return the latest 20 valid tokens, reversed (newest first)
    return validTokens.reverse().slice(0, 20);
  }, [tokenTypes]);

  return { data: recentEvents, isLoading };
}
