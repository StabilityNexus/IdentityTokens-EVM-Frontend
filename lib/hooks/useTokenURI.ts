"use client";

import { useReadContract, useChainId } from "wagmi";
import CLIENT_ABI from "@/lib/abi/TNT.client.abi.json";
import { getTNTAddress } from "@/lib/contracts";

/**
 * Hook: read the ERC-721 tokenURI for a DIT token.
 *
 * Useful for loading off-chain or on-chain metadata JSON to
 * display social profile fields, avatar image, etc.
 *
 * Usage:
 *   const { uri } = useTokenURI(1n);
 */
export function useTokenURI(tokenId: bigint | undefined) {
  const chainId = useChainId();
  const address = getTNTAddress(chainId);

  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: CLIENT_ABI,
    functionName: "tokenURI",
    args: [tokenId!],
    query: { enabled: !!address && tokenId !== undefined },
  });

  return {
    uri: data as string | undefined,
    isLoading,
    error,
    refetch,
  } as const;
}
