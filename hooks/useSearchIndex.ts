"use client";

import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import {
  IDENTITY_SYSTEM_ABI,
  IDENTITY_SYSTEM_ADDRESS,
  PROFILE_SYSTEM_ABI,
  PROFILE_SYSTEM_ADDRESS,
} from "@/lib/contracts";
import { formatTokenId, tokenIdFor, type TokenTypeNum } from "@/lib/tokenId";
import type { SearchEntry } from "@/lib/search";
import type { TokenTuple } from "./useWalletTokenList";
import {
  useMultipleTokenDetails,
  useMultipleTokenOwners,
} from "./useIdentityReads";

const TYPES: TokenTypeNum[] = [0, 1, 2];

const digitsOf = (id: bigint) => formatTokenId(id).slice(3);

// Every live root, token and profile, so search can match partial ids and names
// in the browser. It reads the whole supply, so swap in an indexer once that grows.
export function useSearchIndex(enabled: boolean) {
  const { data: counts, isLoading: isCounting } = useReadContracts({
    contracts: TYPES.map((t) => ({
      address: IDENTITY_SYSTEM_ADDRESS,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "minted" as const,
      args: [BigInt(t)] as const,
    })),
    query: { enabled },
  });

  const [rootIds, tokenIds, profileIds] = useMemo(
    () =>
      TYPES.map((t) => {
        const r = counts?.[t];
        const minted = r?.status === "success" ? Number(r.result) : 0;
        return Array.from({ length: minted }, (_, i) =>
          tokenIdFor(t, BigInt(i + 1))
        );
      }),
    [counts]
  );
  const on = (ids: bigint[]) => (enabled && ids.length > 0 ? ids : undefined);

  const { data: roots } = useReadContracts({
    contracts: rootIds.map((id) => ({
      address: IDENTITY_SYSTEM_ADDRESS,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "rootIdentities" as const,
      args: [id] as const,
    })),
    query: { enabled: !!on(rootIds) },
  });
  const { data: profiles } = useReadContracts({
    contracts: profileIds.map((id) => ({
      address: PROFILE_SYSTEM_ADDRESS,
      abi: PROFILE_SYSTEM_ABI,
      functionName: "getProfile" as const,
      args: [id] as const,
    })),
    query: { enabled: !!on(profileIds) },
  });
  const { data: profileOwners } = useMultipleTokenOwners(on(profileIds));
  const { data: tokens } = useMultipleTokenDetails(on(tokenIds));
  const { data: tokenOwners } = useMultipleTokenOwners(on(tokenIds));

  const entries = useMemo<SearchEntry[]>(() => {
    const out: SearchEntry[] = [];
    const ok = <T>(r: { status: string; result?: unknown } | undefined) =>
      r?.status === "success" ? (r.result as T) : undefined;

    rootIds.forEach((id, i) => {
      const root = ok<readonly [`0x${string}`, string]>(roots?.[i]);
      if (!root) return;
      out.push({
        kind: "root",
        id,
        digits: digitsOf(id),
        title: root[1] || "Unnamed identity",
        owner: root[0],
      });
    });
    profileIds.forEach((id, i) => {
      const profile = ok<{ name: string; username: string }>(profiles?.[i]);
      // Burned profiles read back with an empty username
      if (!profile?.username) return;
      out.push({
        kind: "profile",
        id,
        digits: digitsOf(id),
        title: profile.name,
        username: profile.username,
        owner: ok<string>(profileOwners?.[i]),
      });
    });
    tokenIds.forEach((id, i) => {
      const token = ok<TokenTuple>(tokens?.[i]);
      // Burned tokens read back zeroed
      if (!token || token[7] === 0n) return;
      out.push({
        kind: "token",
        id,
        digits: digitsOf(id),
        title: token[2] || "Unnamed",
        owner: ok<string>(tokenOwners?.[i]),
      });
    });
    return out;
  }, [
    rootIds,
    profileIds,
    tokenIds,
    roots,
    profiles,
    profileOwners,
    tokens,
    tokenOwners,
  ]);

  const isLoading =
    isCounting ||
    (!!on(rootIds) && !roots) ||
    (!!on(profileIds) && !profiles) ||
    (!!on(tokenIds) && !tokens);

  return { entries, isLoading };
}
