"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import TNT_ABI from "@/lib/abi/TNT.abi.json";
import { getTNTAddress } from "@/lib/contracts";

/**
 * Hook: issue a new DIT identity token to the connected wallet.
 *
 * DIT spec: "anyone can self-issue a token" — no arguments required;
 * the contract mints directly to msg.sender.
 *
 * Usage:
 *   const { issueToken, isPending, isSuccess, tokenId } = useIssueIdentityToken();
 *   <button onClick={issueToken} disabled={isPending}>Mint Identity</button>
 */
export function useIssueIdentityToken() {
  const chainId = useChainId();
  const address = getTNTAddress(chainId);

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function issueToken() {
    if (!address) throw new Error(`TNT not deployed on chain ${chainId}`);
    writeContract({
      address,
      abi: TNT_ABI,
      functionName: "issueToken",
    });
  }

  return {
    issueToken,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  } as const;
}
