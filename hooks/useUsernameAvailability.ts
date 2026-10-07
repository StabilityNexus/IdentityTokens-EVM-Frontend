"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { zeroAddress } from "viem";
import { IDENTITY_SYSTEM_ABI, IDENTITY_SYSTEM_ADDRESS } from "@/lib/contracts";
import { CLAIM_CHAIN } from "@/lib/claim";
import { tokenIdFor } from "@/lib/tokenId";
import { TOKEN_TYPE } from "@/lib/types";
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

/** Root identities read per multicall while scanning. */
const SCAN_BATCH = 250n;

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
      // Root ids are tokenIdFor(ROOT, 1..minted[ROOT]), not sequential
      const rootCount = await client.readContract({
        address: IDENTITY_SYSTEM_ADDRESS,
        abi: IDENTITY_SYSTEM_ABI,
        functionName: "minted",
        args: [BigInt(TOKEN_TYPE.ROOT)],
      });
      const names = new Set<string>();

      for (let start = 1n; start <= rootCount; start += SCAN_BATCH) {
        const end =
          start + SCAN_BATCH > rootCount ? rootCount + 1n : start + SCAN_BATCH;
        const roots = await client.multicall({
          allowFailure: true,
          contracts: Array.from({ length: Number(end - start) }, (_, i) => ({
            address: IDENTITY_SYSTEM_ADDRESS,
            abi: IDENTITY_SYSTEM_ABI,
            functionName: "rootIdentities" as const,
            args: [tokenIdFor(TOKEN_TYPE.ROOT, start + BigInt(i))] as const,
          })),
        });

        for (const root of roots) {
          if (root.status !== "success") continue;
          const [walletAddress, displayName] = root.result;
          if (walletAddress === zeroAddress) continue;
          names.add(displayName.trim().toLowerCase());
        }
      }
      return names;
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
