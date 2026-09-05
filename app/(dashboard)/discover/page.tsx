"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { TokenList } from "@/components/dashboard/TokenList";
import { AttestModal } from "@/components/forms/AttestModal";
import { useIdentityGate } from "@/hooks/useIdentityGate";
import {
  useTokenDetail,
  useActiveAttestationCount,
  useTokenOwner,
  useRecentTokens,
  useMultipleTokenDetails,
  useMultipleAttestationCounts,
  useMultipleTokenOwners,
} from "@/hooks/useIdentityReads";
import { formatExpiry, truncateAddress } from "@/lib/helpers";

function SearchedToken({
  tokenId,
  onAttest,
  onRevoke,
}: {
  tokenId: bigint;
  onAttest: (tokenId: bigint, tokenName: string) => void;
  onRevoke: (tokenId: string) => void;
}) {
  const { data: token } = useTokenDetail(tokenId);
  const { data: attestationCount } = useActiveAttestationCount(tokenId);
  const { data: owner } = useTokenOwner(tokenId);

  if (!token) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-card-border bg-card-bg py-12">
        <div className="text-center">
          <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
          <p className="font-utsaha text-sm text-gray-400">
            Loading token #{tokenId.toString()}…
          </p>
        </div>
      </div>
    );
  }

  // Token struct: [tokenId, parentRootId, tokenName, tokenType, tokenValue, about, validUntil, ...]
  const tokenTuple = token as readonly [
    bigint,
    bigint,
    string,
    string,
    `0x${string}`,
    string,
    bigint,
    bigint,
    bigint,
    bigint,
    boolean,
    bigint,
    bigint,
  ];
  const tokenName = tokenTuple[2] || "Unnamed";
  const tokenType = tokenTuple[3] || "Unknown";
  const validUntil = tokenTuple[6];
  const attestCount = Number(attestationCount ?? 0n);
  const ownerStr = owner ? truncateAddress(owner as string) : "…";

  const tokenData = [
    {
      tokenId: `#${tokenId.toString()}`,
      name: tokenName,
      type: tokenType,
      expiresIn: formatExpiry(validUntil),
      attestations: attestCount,
      owner: ownerStr,
    },
  ];

  return (
    <TokenList
      variant="discover"
      tokens={tokenData}
      onAttest={() => onAttest(tokenId, tokenName)}
      onRevoke={(id) => onRevoke(id)}
    />
  );
}

function RecentTokensFeed({
  onAttest,
  onRevoke,
}: {
  onAttest: (tokenId: bigint, tokenName: string) => void;
  onRevoke: (tokenId: string) => void;
}) {
  const { data: recentEvents, isLoading: isEventsLoading } = useRecentTokens();

  const filteredEvents = useMemo(() => {
    if (!recentEvents) return [];
    return recentEvents.filter((e) => e.tokenType !== "ROOT");
  }, [recentEvents]);

  const tokenIds = useMemo(
    () =>
      filteredEvents.map(
        (e: { tokenId: bigint; tokenType: string }) => e.tokenId
      ),
    [filteredEvents]
  );

  const { data: tokenDetails } = useMultipleTokenDetails(
    tokenIds.length > 0 ? tokenIds : undefined
  );
  const { data: attestationCounts } = useMultipleAttestationCounts(
    tokenIds.length > 0 ? tokenIds : undefined
  );
  const { data: tokenOwners } = useMultipleTokenOwners(
    tokenIds.length > 0 ? tokenIds : undefined
  );

  const tokenData = useMemo(() => {
    if (!tokenIds || tokenIds.length === 0) return [];

    return tokenIds.map((id: bigint, i: number) => {
      const detail = tokenDetails?.[i];
      const attestResult = attestationCounts?.[i];
      const ownerResult = tokenOwners?.[i];

      const token = detail?.status === "success" ? detail.result : undefined;
      const attestCount =
        attestResult?.status === "success" ? Number(attestResult.result) : 0;
      const owner =
        ownerResult?.status === "success"
          ? (ownerResult.result as string)
          : undefined;

      const tokenTuple = token as
        | readonly [
            bigint,
            bigint,
            string,
            string,
            `0x${string}`,
            string,
            bigint,
            bigint,
            bigint,
            bigint,
            boolean,
            bigint,
            bigint,
          ]
        | undefined;

      const ownerStr = owner ? truncateAddress(owner) : "…";

      return {
        tokenId: `#${id.toString()}`,
        name: tokenTuple ? tokenTuple[2] || "Unnamed" : "Loading…",
        type: tokenTuple ? tokenTuple[3] || "Unknown" : "…",
        expiresIn: tokenTuple ? formatExpiry(tokenTuple[6]) : "…",
        attestations: attestCount,
        owner: ownerStr,
      };
    });
  }, [tokenIds, tokenDetails, attestationCounts, tokenOwners]);

  if (isEventsLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-card-border bg-card-bg py-12">
        <div className="text-center">
          <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
          <p className="font-utsaha text-sm text-gray-400">
            Loading recent tokens…
          </p>
        </div>
      </div>
    );
  }

  if (tokenData.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-card-border bg-card-bg py-16">
        <div className="text-center">
          <p className="font-utsaha text-lg text-gray-400">
            No recent tokens found
          </p>
          <p className="mt-2 font-utsaha text-sm text-gray-500">
            Tokens created recently will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <TokenList
      variant="discover"
      tokens={tokenData}
      onAttest={(id) => {
        const numericId = BigInt(id.replace(/^#/, ""));
        const token = tokenData.find((t) => t.tokenId === id);
        onAttest(numericId, token?.name || "");
      }}
      onRevoke={(id) => onRevoke(id)}
    />
  );
}

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") ?? "";

  // The searched id is fully derived from the query string, so it needs no
  // state of its own.
  const searchedTokenId = useMemo(() => {
    const cleaned = query.trim().replace(/^#/, "");
    return /^\d+$/.test(cleaned) ? BigInt(cleaned) : null;
  }, [query]);

  const [attestTarget, setAttestTarget] = useState<{
    tokenId: bigint;
    tokenName: string;
  } | null>(null);

  const { isConnected } = useIdentityGate();

  // A "connect your wallet" notice already renders inline below, so a
  // disconnected wallet just makes these no-ops rather than firing a blocking
  // alert().
  const handleAttest = (tokenId: bigint, tokenName: string) => {
    if (!isConnected) return;
    setAttestTarget({ tokenId, tokenName });
  };

  const handleRevoke = (tokenIdStr: string) => {
    if (!isConnected) return;
    console.log("Revoking attestation for:", tokenIdStr);
  };

  return (
    <main className="flex flex-col gap-6 px-4 pt-9 pb-12 sm:px-6 md:pr-14 md:pl-10">
      {!isConnected && (
        <div className="rounded-2xl border border-white/10 bg-card-bg p-6 text-center">
          <p className="font-utsaha text-gray-400">
            Connect your wallet to attest or revoke tokens
          </p>
        </div>
      )}

      {/* Search Results or Recent Feed */}
      {searchedTokenId !== null ? (
        <SearchedToken
          tokenId={searchedTokenId}
          onAttest={handleAttest}
          onRevoke={handleRevoke}
        />
      ) : (
        <RecentTokensFeed onAttest={handleAttest} onRevoke={handleRevoke} />
      )}

      {/* Attest Modal */}
      {attestTarget && (
        <AttestModal
          isOpen={true}
          onClose={() => setAttestTarget(null)}
          tokenId={attestTarget.tokenId}
          tokenName={attestTarget.tokenName}
        />
      )}
    </main>
  );
}
