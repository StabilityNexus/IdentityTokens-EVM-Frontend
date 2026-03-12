"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import CLIENT_ABI from "@/lib/abi/TNT.client.abi.json";
import { getTNTAddress } from "@/lib/contracts";

/**
 * Hook: set (or update) the metadata URI for a DIT token.
 *
 * The URI should point to a JSON file conforming to the ERC-721 metadata standard:
 * { "name": "...", "description": "...", "image": "...", "attributes": [...] }
 *
 * Typical URIs: "ipfs://Qm...", "https://api.example.com/tokens/1"
 *
 * Usage:
 *   const { setTokenURI, isPending } = useSetTokenURI();
 *   setTokenURI({ tokenId: 1n, uri: "ipfs://Qm..." });
 */
export function useSetTokenURI() {
  const chainId = useChainId();
  const address = getTNTAddress(chainId);

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  function setTokenURI({ tokenId, uri }: { tokenId: bigint; uri: string }) {
    if (!address) throw new Error(`TNT not deployed on chain ${chainId}`);
    writeContract({
      address,
      abi: CLIENT_ABI,
      functionName: "setTokenURI",
      args: [tokenId, uri],
    });
  }

  return {
    setTokenURI,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error: error ?? receiptError,
  } as const;
}
