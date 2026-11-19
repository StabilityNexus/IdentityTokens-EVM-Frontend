"use client";

import { useChainId } from "wagmi";
import { SYSTEM_ADDRESSES, type SystemAddresses } from "@/lib/contracts";

/**
 * The contract addresses for the chain a hook is calling. Pass `chainId` when
 * reading another chain, as `/claim` does; otherwise the connected chain is
 * used. Undefined means the contracts are not deployed on that chain.
 */
export function useSystemAddresses(
  chainId?: number
): SystemAddresses | undefined {
  const connectedChainId = useChainId();
  return SYSTEM_ADDRESSES[chainId ?? connectedChainId];
}

/** IdentitySystem address for a chain, or undefined when it has no deployment. */
export function useIdentitySystemAddress(
  chainId?: number
): `0x${string}` | undefined {
  return useSystemAddresses(chainId)?.identity;
}

/** ProfileSystem address for a chain, or undefined when it has no deployment. */
export function useProfileSystemAddress(
  chainId?: number
): `0x${string}` | undefined {
  return useSystemAddresses(chainId)?.profile;
}
