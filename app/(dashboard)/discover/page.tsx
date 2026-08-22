"use client";

import React, { useState, useMemo } from "react";
import { TokenList } from "@/components/dashboard/TokenList";
import { EndorseModal } from "@/components/forms/EndorseModal";
import { useIdentityGate } from "@/hooks/useIdentityGate";
import {
  useTokenDetail,
  useActiveEndorsementCount,
  useTokenOwner,
  useRecentTokens,
  useMultipleTokenDetails,
  useMultipleEndorsementCounts,
  useMultipleTokenOwners,
} from "@/hooks/useIdentityReads";
import { formatExpiry } from "@/lib/helpers";

function SearchedToken({
  tokenId,
  onEndorse,
  onRevoke,
}: {
  tokenId: bigint;
  onEndorse: (tokenId: bigint, tokenName: string) => void;
  onRevoke: (tokenId: string) => void;
}) {
  const { data: token } = useTokenDetail(tokenId);
  const { data: endorsementCount } = useActiveEndorsementCount(tokenId);
  const { data: owner } = useTokenOwner(tokenId);

  if (!token) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-card-border bg-card-bg py-12">
        <div className="text-center">
          <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
          <p className="font-utsaha text-sm text-gray-400">Loading token #{tokenId.toString()}…</p>
        </div>
      </div>
    );
  }

  // Token struct: [tokenId, parentRootId, tokenName, tokenType, tokenValue, about, validUntil, ...]
  const tokenTuple = token as readonly [bigint, bigint, string, string, `0x${string}`, string, bigint, bigint, bigint, bigint, boolean, bigint, bigint];
  const tokenName = tokenTuple[2] || "Unnamed";
  const tokenType = tokenTuple[3] || "Unknown";
  const validUntil = tokenTuple[6];
  const endorseCount = Number(endorsementCount ?? 0n);
  const ownerStr = owner ? `${(owner as string).slice(0, 6)}…${(owner as string).slice(-4)}` : "…";

  const tokenData = [
    {
      tokenId: `#${tokenId.toString()}`,
      name: tokenName,
      type: tokenType,
      expiresIn: formatExpiry(validUntil),
      endorsements: endorseCount,
      owner: ownerStr,
    },
  ];

  return (
    <TokenList
      variant="discover"
      tokens={tokenData}
      onEndorse={() => onEndorse(tokenId, tokenName)}
      onRevoke={(id) => onRevoke(id)}
    />
  );
}

function RecentTokensFeed({
  onEndorse,
  onRevoke,
}: {
  onEndorse: (tokenId: bigint, tokenName: string) => void;
  onRevoke: (tokenId: string) => void;
}) {
  const { data: recentEvents, isLoading: isEventsLoading } = useRecentTokens();

  const filteredEvents = useMemo(() => {
    if (!recentEvents) return [];
    return recentEvents.filter(
      (e: any) => e.tokenType !== "ROOT"
    );
  }, [recentEvents]);

  const tokenIds = useMemo(() => filteredEvents.map((e: { tokenId: bigint; tokenType: string }) => e.tokenId), [filteredEvents]);

  const { data: tokenDetails } = useMultipleTokenDetails(tokenIds.length > 0 ? tokenIds : undefined);
  const { data: endorsementCounts } = useMultipleEndorsementCounts(tokenIds.length > 0 ? tokenIds : undefined);
  const { data: tokenOwners } = useMultipleTokenOwners(tokenIds.length > 0 ? tokenIds : undefined);

  const tokenData = useMemo(() => {
    if (!tokenIds || tokenIds.length === 0) return [];

    return tokenIds.map((id: bigint, i: number) => {
      const detail = tokenDetails?.[i];
      const endorseResult = endorsementCounts?.[i];
      const ownerResult = tokenOwners?.[i];

      const token = detail?.status === "success" ? detail.result : undefined;
      const endorseCount = endorseResult?.status === "success" ? Number(endorseResult.result) : 0;
      const owner = ownerResult?.status === "success" ? ownerResult.result as string : undefined;

      const tokenTuple = token as readonly [bigint, bigint, string, string, `0x${string}`, string, bigint, bigint, bigint, bigint, boolean, bigint, bigint] | undefined;

      const ownerStr = owner ? `${owner.slice(0, 6)}…${owner.slice(-4)}` : "…";

      return {
        tokenId: `#${id.toString()}`,
        name: tokenTuple ? tokenTuple[2] || "Unnamed" : "Loading…",
        type: tokenTuple ? tokenTuple[3] || "Unknown" : "…",
        expiresIn: tokenTuple ? formatExpiry(tokenTuple[6]) : "…",
        endorsements: endorseCount,
        owner: ownerStr,
      };
    });
  }, [tokenIds, tokenDetails, endorsementCounts, tokenOwners]);

  if (isEventsLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-card-border bg-card-bg py-12">
        <div className="text-center">
          <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
          <p className="font-utsaha text-sm text-gray-400">Loading recent tokens…</p>
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
      onEndorse={(id) => {
        const numericId = BigInt(id.replace(/^#/, ""));
        const token = tokenData.find((t) => t.tokenId === id);
        onEndorse(numericId, token?.name || "");
      }}
      onRevoke={(id) => onRevoke(id)}
    />
  );
}

import { useSearchParams } from "next/navigation";

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") ?? "";

  const [searchedTokenId, setSearchedTokenId] = useState<bigint | null>(null);
  const [endorseTarget, setEndorseTarget] = useState<{
    tokenId: bigint;
    tokenName: string;
  } | null>(null);

  const { isConnected } = useIdentityGate();

  React.useEffect(() => {
    const cleaned = query.trim().replace(/^#/, "");
    if (/^\d+$/.test(cleaned)) {
      setSearchedTokenId(BigInt(cleaned));
    } else {
      setSearchedTokenId(null);
    }
  }, [query]);

  const handleEndorse = (tokenId: bigint, tokenName: string) => {
    if (!isConnected) {
      alert("Connect your wallet to endorse tokens.");
      return;
    }
    setEndorseTarget({ tokenId, tokenName });
  };

  const handleRevoke = (tokenIdStr: string) => {
    if (!isConnected) {
      alert("Connect your wallet to revoke endorsements.");
      return;
    }
    console.log("Revoking endorsement for:", tokenIdStr);
  };

  return (
    <main className="flex flex-col gap-6 px-4 pt-9 pb-12 sm:px-6 md:pr-14 md:pl-10">
      {!isConnected && (
        <div className="rounded-2xl border border-white/10 bg-card-bg p-6 text-center">
          <p className="font-utsaha text-gray-400">
            Connect your wallet to endorse or revoke tokens
          </p>
        </div>
      )}

      {/* Search Results or Recent Feed */}
      {searchedTokenId !== null ? (
        <SearchedToken
          tokenId={searchedTokenId}
          onEndorse={handleEndorse}
          onRevoke={handleRevoke}
        />
      ) : (
        <RecentTokensFeed
          onEndorse={handleEndorse}
          onRevoke={handleRevoke}
        />
      )}

      {/* Endorse Modal */}
      {endorseTarget && (
        <EndorseModal
          isOpen={true}
          onClose={() => setEndorseTarget(null)}
          tokenId={endorseTarget.tokenId}
          tokenName={endorseTarget.tokenName}
        />
      )}
    </main>
  );
}
