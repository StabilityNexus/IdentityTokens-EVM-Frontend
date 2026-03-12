"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import CLIENT_ABI from "@/lib/abi/TNT.client.abi.json";
import { getTNTAddress } from "@/lib/contracts";

/**
 * Hook: revoke a previously given endorsement.
 *
 * Caller must own `fromId`. `index` is the position in the endorsement array
 * for `toId` (use `useGetEndorsements` to find the correct index).
 *
 * Usage:
 *   const { revokeEndorsement, isPending } = useRevokeEndorsement();
 *   revokeEndorsement({ fromId: 1n, toId: 2n, index: 0n });
 */
export function useRevokeEndorsement() {
  const chainId = useChainId();
  const address = getTNTAddress(chainId);

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  function revokeEndorsement({
    fromId,
    toId,
    index,
  }: {
    fromId: bigint;
    toId: bigint;
    index: bigint;
  }) {
    if (!address) throw new Error(`TNT not deployed on chain ${chainId}`);
    writeContract({
      address,
      abi: CLIENT_ABI,
      functionName: "revokeEndorsement",
      args: [fromId, toId, index],
    });
  }

  return {
    revokeEndorsement,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error: error ?? receiptError,
  } as const;
}
