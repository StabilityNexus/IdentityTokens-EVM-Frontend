"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import { keccak256, toBytes, type Hex } from "viem";
import CLIENT_ABI from "@/lib/abi/TNT.client.abi.json";
import { getTNTAddress } from "@/lib/contracts";

export type KnownAttributeKey =
  | "name"
  | "twitter"
  | "linkedin"
  | "github"
  | "nationality"
  | "residence"
  | "age_group";

/**
 * Returns the bytes32 key hash for an attribute name.
 * Matches Solidity's keccak256(abi.encodePacked(key)).
 */
export function attributeKeyHash(key: string): Hex {
  return keccak256(toBytes(key));
}

/**
 * Hook: set a single utf-8 attribute on a DIT token.
 *
 * The on-chain key is bytes32 (a keccak256 hash). Pass either a raw bytes32 hex
 * string, or a plain string key (the hook will hash it for you).
 *
 * Usage:
 *   const { setAttribute, isPending } = useSetAttribute();
 *   setAttribute({ tokenId: 1n, key: "name", value: "Alice" });
 */
export function useSetAttribute() {
  const chainId = useChainId();
  const address = getTNTAddress(chainId);

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  function setAttribute({
    tokenId,
    key,
    value,
  }: {
    tokenId: bigint;
    /** Either a plain string (will be keccak256'd) or a raw 0x-prefixed bytes32. */
    key: string;
    value: string;
  }) {
    if (!address) throw new Error(`TNT not deployed on chain ${chainId}`);

    const keyHash: Hex =
      key.startsWith("0x") && key.length === 66
        ? (key as Hex)
        : attributeKeyHash(key);

    const encoded = new TextEncoder().encode(value);

    writeContract({
      address,
      abi: CLIENT_ABI,
      functionName: "setAttribute",
      args: [tokenId, keyHash, encoded],
    });
  }

  return {
    setAttribute,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error: error ?? receiptError,
  } as const;
}
