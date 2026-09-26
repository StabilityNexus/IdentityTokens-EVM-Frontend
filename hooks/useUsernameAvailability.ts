"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { zeroAddress } from "viem";
import { IDENTITY_SYSTEM_ABI, IDENTITY_SYSTEM_ADDRESS } from "@/lib/contracts";
import { CLAIM_CHAIN } from "@/lib/claim";
import { validateUsername } from "@/lib/validation";
import { useUsernameTaken } from "./useIdentityReads";

export type AvailabilityStatus =
  | "idle"
  | "invalid"
  | "checking"
  | "available"
  | "taken"
  | "error";

export interface UsernameAvailability {
  status: AvailabilityStatus;
  message?: string;
  retry: () => void;
}

const DEBOUNCE_MS = 350;

/** Token ids read per multicall while scanning for root identities. */
const SCAN_BATCH = 250;

/** This many unminted ids in a row means the scan is past the last token. */
const END_GAP = 64;

/** Every root display name, lowercased; root names aren't unique on-chain. */
export function useReservedRootNames() {
  const client = usePublicClient({ chainId: CLAIM_CHAIN.id });

  return useQuery({
    queryKey: ["claim", "root-names", CLAIM_CHAIN.id, IDENTITY_SYSTEM_ADDRESS],
    enabled: !!client,
    staleTime: 60_000,
    // Fail fast: the profile check still answers without this.
    retry: 1,
    queryFn: async () => {
      if (!client) throw new Error("No Sepolia client");
      const names = new Set<string>();

      for (let start = 1n; ; start += BigInt(SCAN_BATCH)) {
        const ids = Array.from(
          { length: SCAN_BATCH },
          (_, i) => start + BigInt(i)
        );

        // ownerOf also counts live sub/profile tokens, so burned gaps don't stop the scan.
        const [roots, owners] = await Promise.all([
          client.multicall({
            allowFailure: true,
            contracts: ids.map((id) => ({
              address: IDENTITY_SYSTEM_ADDRESS,
              abi: IDENTITY_SYSTEM_ABI,
              functionName: "rootIdentities" as const,
              args: [id] as const,
            })),
          }),
          client.multicall({
            allowFailure: true,
            contracts: ids.map((id) => ({
              address: IDENTITY_SYSTEM_ADDRESS,
              abi: IDENTITY_SYSTEM_ABI,
              functionName: "ownerOf" as const,
              args: [id] as const,
            })),
          }),
        ]);

        let lastMinted = -1;
        ids.forEach((_, i) => {
          if (owners[i].status === "success") lastMinted = i;

          const root = roots[i];
          if (root.status !== "success") return;
          const [walletAddress, displayName] = root.result;
          if (walletAddress === zeroAddress) return;

          lastMinted = i;
          names.add(displayName.trim().toLowerCase());
        });

        if (SCAN_BATCH - 1 - lastMinted >= END_GAP) return names;
      }
    },
  });
}

/** Availability of a /claim username: format first, then the on-chain checks. */
export function useUsernameAvailability(
  username: string
): UsernameAvailability {
  const [settled, setSettled] = useState(username);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(username), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [username]);

  const validation = validateUsername(username);
  const isSettled = settled === username;
  const checkable = validation.status === "valid" && isSettled;

  const profileTaken = useUsernameTaken(
    checkable ? settled : undefined,
    CLAIM_CHAIN.id
  );
  const rootNames = useReservedRootNames();

  const retry = () => {
    void profileTaken.refetch();
    void rootNames.refetch();
  };

  if (!username) return { status: "idle", retry };

  if (validation.status === "invalid") {
    return { status: "invalid", message: validation.message, retry };
  }

  if (!checkable || profileTaken.isPending || rootNames.isPending) {
    return { status: "checking", retry };
  }

  if (profileTaken.isError) {
    return {
      status: "error",
      message: "Couldn’t check availability. Try again in a moment.",
      retry,
    };
  }

  if (profileTaken.data || rootNames.data?.has(username)) {
    return { status: "taken", message: "Already taken.", retry };
  }

  return { status: "available", retry };
}
