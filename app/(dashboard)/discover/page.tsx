"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TokenList } from "@/components/dashboard/TokenList";
import { AttestModal } from "@/components/forms/AttestModal";
import { AttestersModal } from "@/components/attestations/AttestersModal";
import { useIdentityGate } from "@/hooks/useIdentityGate";
import type { TokenTuple } from "@/hooks/useWalletTokenList";
import {
  useTokenDetail,
  useActiveAttestationCount,
  useTokenOwner,
  useRecentTokens,
  useMultipleTokenDetails,
  useMultipleAttestationCounts,
  useMultipleTokenOwners,
  useProfile,
  useResolveUsername,
  useRootIdentityView,
} from "@/hooks/useIdentityReads";
import { formatExpiry, truncateAddress } from "@/lib/helpers";
import { formatTokenId, parseTokenId, tokenTypeOf } from "@/lib/tokenId";
import { TOKEN_TYPE } from "@/lib/types";
import { validateUsername } from "@/lib/validation";

function SearchMessage({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-card-border bg-card-bg py-16">
      <div className="px-4 text-center">
        <p className="font-utsaha text-lg text-gray-400">{title}</p>
        {hint && (
          <p className="mt-2 font-utsaha text-sm text-gray-500">{hint}</p>
        )}
      </div>
    </div>
  );
}

function SearchLoading({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-card-border bg-card-bg py-12">
      <div className="text-center">
        <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
        <p className="font-utsaha text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
}

/** One search hit that links to the page that can render it in full. */
function ResultCard({
  title,
  subtitle,
  id,
  href,
  action,
}: {
  title: string;
  subtitle: string;
  id: string;
  href: string;
  action: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card-bg p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="min-w-0">
        <h3 className="truncate font-utsaha text-lg text-white">{title}</h3>
        <p className="truncate font-utsaha text-sm text-gray-500">
          {subtitle} · ID: {id}
        </p>
      </div>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-green px-5 py-2 font-utsaha text-base font-semibold text-dashboard-bg transition-transform duration-200 hover:scale-[1.02] hover:bg-brand-green/90"
      >
        {action}
      </Link>
    </div>
  );
}

function ProfileResult({ tokenId }: { tokenId: bigint }) {
  const { data: profile, isLoading } = useProfile(tokenId);

  if (isLoading) return <SearchLoading label="Loading profile…" />;
  // Burned or never-minted profiles read back with an empty username
  if (!profile?.username) {
    return (
      <SearchMessage
        title={`No profile ${formatTokenId(tokenId)}`}
        hint="Check the id, or search the username instead."
      />
    );
  }

  return (
    <ResultCard
      title={profile.name}
      subtitle={`@${profile.username}`}
      id={formatTokenId(tokenId)}
      href={`/profile?u=${profile.username}`}
      action="View profile"
    />
  );
}

function UsernameResult({ username }: { username: string }) {
  const { data: tokenId, isLoading } = useResolveUsername(username);

  if (isLoading) return <SearchLoading label={`Looking up @${username}…`} />;
  if (!tokenId) {
    return (
      <SearchMessage
        title={`No profile named @${username}`}
        hint="Usernames are exact: lowercase letters, numbers, dots and underscores."
      />
    );
  }
  return <ProfileResult tokenId={tokenId} />;
}

function RootResult({ rootId }: { rootId: bigint }) {
  const { data: root, isLoading } = useRootIdentityView(rootId);

  if (isLoading) return <SearchLoading label="Loading root identity…" />;
  if (!root || /^0x0+$/.test(root.walletAddress)) {
    return (
      <SearchMessage title={`No root identity ${formatTokenId(rootId)}`} />
    );
  }

  return (
    <ResultCard
      title={root.displayName || "Unnamed identity"}
      subtitle={`Root identity of ${truncateAddress(root.walletAddress)} · ${root.tokenCount} tokens`}
      id={formatTokenId(rootId)}
      href={`/wallet?u=${root.walletAddress}`}
      action="View wallet"
    />
  );
}

function SearchedToken({
  tokenId,
  onAttest,
  onRevoke,
  onViewAttesters,
}: {
  tokenId: bigint;
  onAttest: (tokenId: bigint, tokenName: string) => void;
  onRevoke: (tokenId: string) => void;
  onViewAttesters: (tokenId: bigint, tokenName: string) => void;
}) {
  const { data: token } = useTokenDetail(tokenId);
  const { data: attestationCount } = useActiveAttestationCount(tokenId);
  const { data: owner } = useTokenOwner(tokenId);

  if (!token) {
    return <SearchLoading label={`Loading token ${formatTokenId(tokenId)}…`} />;
  }

  const tokenTuple = token as TokenTuple;
  // Burned or never-minted tokens read back zeroed
  if (tokenTuple[7] === 0n) {
    return (
      <SearchMessage
        title={`No token ${formatTokenId(tokenId)}`}
        hint="It may have been burned, or the id has a typo."
      />
    );
  }
  const tokenName = tokenTuple[2] || "Unnamed";
  const tokenType = tokenTuple[3] || "Unknown";
  const validUntil = tokenTuple[6];
  const attestCount = Number(attestationCount ?? 0n);
  const ownerStr = owner ? truncateAddress(owner as string) : "…";

  const tokenData = [
    {
      tokenId: formatTokenId(tokenId),
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
      onViewAll={() => onViewAttesters(tokenId, tokenName)}
    />
  );
}

function RecentTokensFeed({
  onAttest,
  onRevoke,
  onViewAttesters,
}: {
  onAttest: (tokenId: bigint, tokenName: string) => void;
  onRevoke: (tokenId: string) => void;
  onViewAttesters: (tokenId: bigint, tokenName: string) => void;
}) {
  const { data: recentIds, isLoading: isIdsLoading } = useRecentTokens();
  const ids = recentIds.length > 0 ? recentIds : undefined;

  const { data: tokenDetails, isLoading: isDetailsLoading } =
    useMultipleTokenDetails(ids);
  const { data: attestationCounts } = useMultipleAttestationCounts(ids);
  const { data: tokenOwners } = useMultipleTokenOwners(ids);

  // Newest 20 across tokens and profiles; burned ids read back zeroed and drop out
  const tokenData = useMemo(() => {
    if (!ids || !tokenDetails) return [];

    return ids
      .map((id, i) => {
        const detail = tokenDetails[i];
        const token =
          detail?.status === "success"
            ? (detail.result as TokenTuple)
            : undefined;
        return { id, i, token };
      })
      .filter(
        (row): row is { id: bigint; i: number; token: TokenTuple } =>
          !!row.token && row.token[7] > 0n
      )
      .sort((a, b) => Number(b.token[7] - a.token[7]))
      .slice(0, 20)
      .map(({ id, i, token }) => {
        const attestResult = attestationCounts?.[i];
        const ownerResult = tokenOwners?.[i];
        const owner =
          ownerResult?.status === "success"
            ? (ownerResult.result as string)
            : undefined;

        return {
          tokenId: formatTokenId(id),
          name: token[2] || "Unnamed",
          type: token[3] || "Unknown",
          expiresIn: formatExpiry(token[6]),
          attestations:
            attestResult?.status === "success"
              ? Number(attestResult.result)
              : 0,
          owner: owner ? truncateAddress(owner) : "…",
        };
      });
  }, [ids, tokenDetails, attestationCounts, tokenOwners]);

  if (isIdsLoading || (ids && isDetailsLoading)) {
    return <SearchLoading label="Loading recent tokens…" />;
  }

  if (tokenData.length === 0) {
    return (
      <SearchMessage
        title="No recent tokens found"
        hint="Tokens created recently will appear here"
      />
    );
  }

  return (
    <TokenList
      variant="discover"
      tokens={tokenData}
      onAttest={(id) => {
        const token = tokenData.find((t) => t.tokenId === id);
        onAttest(parseTokenId(id)!, token?.name || "");
      }}
      onRevoke={(id) => onRevoke(id)}
      onViewAll={(id) => {
        const token = tokenData.find((t) => t.tokenId === id);
        onViewAttesters(parseTokenId(id)!, token?.name || "");
      }}
    />
  );
}

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const query = (searchParams?.get("q") ?? "").trim();

  // Derived from the query string, so the search needs no state of its own.
  // Ids must be complete (prefix + 10 digits): "tk-1" gets a hint, never a guess.
  const searchedId = parseTokenId(query);
  const searchedType =
    searchedId !== undefined ? tokenTypeOf(searchedId) : undefined;
  const username = query.toLowerCase();
  const isUsername =
    searchedId === undefined && validateUsername(username).status === "valid";

  const [attestTarget, setAttestTarget] = useState<{
    tokenId: bigint;
    tokenName: string;
  } | null>(null);

  // Anyone may inspect a token's attesters, connected or not.
  const [attestersTarget, setAttestersTarget] = useState<{
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
      {!query ? (
        <RecentTokensFeed
          onAttest={handleAttest}
          onRevoke={handleRevoke}
          onViewAttesters={(tokenId, tokenName) =>
            setAttestersTarget({ tokenId, tokenName })
          }
        />
      ) : searchedId !== undefined && searchedType === TOKEN_TYPE.SUB ? (
        <SearchedToken
          tokenId={searchedId}
          onAttest={handleAttest}
          onRevoke={handleRevoke}
          onViewAttesters={(tokenId, tokenName) =>
            setAttestersTarget({ tokenId, tokenName })
          }
        />
      ) : searchedId !== undefined && searchedType === TOKEN_TYPE.PROFILE ? (
        <ProfileResult tokenId={searchedId} />
      ) : searchedId !== undefined ? (
        <RootResult rootId={searchedId} />
      ) : isUsername ? (
        <UsernameResult username={username} />
      ) : /^(id|tk|pf)-/i.test(query) ? (
        <SearchMessage
          title="Ids have 10 digits after the prefix"
          hint="For example tk-0901699435. Copy the full id from the token or profile."
        />
      ) : (
        <SearchMessage
          title="Nothing matches that search"
          hint="Search a token (tk-…), profile (pf-…), root identity (id-…) or a username."
        />
      )}

      {attestersTarget && (
        <AttestersModal
          isOpen
          onClose={() => setAttestersTarget(null)}
          tokenId={attestersTarget.tokenId}
          tokenName={attestersTarget.tokenName}
        />
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
