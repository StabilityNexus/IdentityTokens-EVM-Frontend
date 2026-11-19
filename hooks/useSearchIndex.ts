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

export function useSearchIndex(enabled: boolean) {
  const {
    data: counts,
    isLoading: isCounting,
    isError: countsError,
  } = useReadContracts({
    contracts: TYPES.map((t) => ({
      address: IDENTITY_SYSTEM_ADDRESS,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "minted" as const,
      args: [BigInt(t)] as const,
    })),
    query: { enabled },
  });
  const countsReady =
    !!counts &&
    counts.length === TYPES.length &&
    counts.every((read) => read.status === "success");

  const [rootIds, tokenIds, profileIds] = useMemo(
    () =>
      TYPES.map((t) => {
        const r = counts?.[t];

        if (r?.status !== "success") {
          return [];
        }

        const minted = Number(r.result);

        return Array.from({ length: minted }, (_, i) =>
          tokenIdFor(t, BigInt(i + 1))
        );
      }),
    [counts]
  );

  const on = (ids: bigint[]) =>
    enabled && countsReady && ids.length > 0 ? ids : undefined;

  const {
    data: roots,
    isLoading: isLoadingRoots,
    isError: rootsError,
  } = useReadContracts({
    contracts: rootIds.map((id) => ({
      address: IDENTITY_SYSTEM_ADDRESS,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "rootIdentities" as const,
      args: [id] as const,
    })),
    query: { enabled: !!on(rootIds) },
  });

  const {
    data: profiles,
    isLoading: isLoadingProfiles,
    isError: profilesError,
  } = useReadContracts({
    contracts: profileIds.map((id) => ({
      address: PROFILE_SYSTEM_ADDRESS,
      abi: PROFILE_SYSTEM_ABI,
      functionName: "getProfile" as const,
      args: [id] as const,
    })),
    query: { enabled: !!on(profileIds) },
  });

  const profileOwnersQuery = useMultipleTokenOwners(on(profileIds));
  const tokensQuery = useMultipleTokenDetails(on(tokenIds));
  const tokenOwnersQuery = useMultipleTokenOwners(on(tokenIds));

  const profileOwners = profileOwnersQuery.data;
  const tokens = tokensQuery.data;
  const tokenOwners = tokenOwnersQuery.data;

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

  const failed = (reads?: readonly { status: string }[]) =>
    reads?.some((read) => read.status === "failure") ?? false;

  const allCountsFailed =
    !!counts &&
    counts.length === TYPES.length &&
    counts.every((read) => read.status === "failure");

  const hasError =
    countsError ||
    allCountsFailed ||
    rootsError ||
    profilesError ||
    profileOwnersQuery.isError ||
    tokensQuery.isError ||
    tokenOwnersQuery.isError ||
    failed(counts) ||
    failed(roots) ||
    failed(profiles) ||
    failed(profileOwners) ||
    failed(tokens) ||
    failed(tokenOwners);

  const isLoading =
    isCounting ||
    isLoadingRoots ||
    isLoadingProfiles ||
    profileOwnersQuery.isLoading ||
    tokensQuery.isLoading ||
    tokenOwnersQuery.isLoading ||
    (!!on(rootIds) && !roots) ||
    (!!on(profileIds) && !profiles) ||
    (!!on(tokenIds) && !tokens);

  return { entries, isLoading, hasError };
}
