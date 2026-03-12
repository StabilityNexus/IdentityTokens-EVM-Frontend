"use client";

import { useReadContract, useChainId } from "wagmi";
import { hexToBytes, type Hex } from "viem";
import CLIENT_ABI from "@/lib/abi/TNT.client.abi.json";
import { getTNTAddress } from "@/lib/contracts";
import { attributeKeyHash } from "@/lib/hooks/useSetAttribute";

/**
 * Hook: read a single attribute from a DIT token and decode it as UTF-8 text.
 *
 * Pass `key` as a plain string (e.g. "name", "twitter") — the hook hashes it
 * the same way `useSetAttribute` does.
 *
 * Usage:
 *   const { value } = useGetAttribute({ tokenId: 1n, key: "name" });
 *   // value === "Alice"
 */
export function useGetAttribute({
  tokenId,
  key,
}: {
  tokenId: bigint | undefined;
  key: string;
}) {
  const chainId = useChainId();
  const address = getTNTAddress(chainId);

  const keyHash: Hex =
    key.startsWith("0x") && key.length === 66
      ? (key as Hex)
      : attributeKeyHash(key);

  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: CLIENT_ABI,
    functionName: "getAttribute",
    args: [tokenId!, keyHash],
    query: { enabled: !!address && tokenId !== undefined && !!key },
  });

  // data is raw bytes from the contract; decode as UTF-8 string
  const value =
    data && (data as `0x${string}`).length > 2
      ? new TextDecoder().decode(
          new Uint8Array(
            hexToBytes((data as `0x${string}`).slice(2) as `0x${string}`)
          )
        )
      : undefined;

  return {
    value,
    raw: data as `0x${string}` | undefined,
    isLoading,
    error,
    refetch,
  } as const;
}
