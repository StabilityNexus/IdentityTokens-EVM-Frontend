"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { ActiveAllToggle, StatusBadge } from "./AttestersModal";
import { Modal } from "@/components/ui/Modal";
import { ProfileCard } from "@/components/profile/ProfileCard";
import {
  attestationStatus,
  countActiveAttesters,
  formatAttestationLength,
  formatTimeAgo,
} from "@/lib/helpers";
import { formatTokenId, tokenTypeOf } from "@/lib/tokenId";
import { TOKEN_TYPE, TokenAttester, WhoAttestedData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface WhoAttestedProps extends WhoAttestedData {
  /** The dashboard card beside the ID card, or the profile page's side card. */
  variant: "dashboard" | "profile";
}

// Rows are a fixed height, so the loading and empty states can hold exactly the
// space the rows take. The dashboard card can't outgrow the ID card beside it,
// so it fits 3 rows. Gaps are in px.
const ROW_PX = 54;
const VARIANTS = {
  dashboard: {
    rows: 3,
    gap: 6,
    viewAll: "text-brand-blue hover:text-blue-400",
  },
  profile: {
    rows: 4,
    gap: 16,
    viewAll: "text-profile-accent-soft hover:text-white",
  },
} as const;

const isActive = (attester: TokenAttester) =>
  attestationStatus(attester.attestation) === "active";

/** Who attested a wallet's tokens, newest first, with the full list in a modal. */
export function WhoAttested({
  attesters,
  isLoading,
  isError,
  variant,
}: WhoAttestedProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { rows, gap, viewAll } = VARIANTS[variant];
  const shown = attesters.filter(isActive).slice(0, rows);
  const people = countActiveAttesters(attesters);
  const title = people > 0 ? `Who attested · ${people}` : "Who attested";

  // Whatever the card leaves out, revoked and expired included, is in the modal.
  const action = attesters.length > shown.length && (
    <button
      type="button"
      onClick={() => setIsModalOpen(true)}
      className={cn("shrink-0 font-utsaha text-sm transition-colors", viewAll)}
    >
      View all
    </button>
  );

  const body = (
    <div
      className="flex flex-1 flex-col"
      style={{ minHeight: rows * ROW_PX + (rows - 1) * gap }}
    >
      {isError ? (
        <p className="m-auto font-utsaha text-sm text-red-300">
          Couldn&rsquo;t load attestations.
        </p>
      ) : isLoading ? (
        <div className="flex flex-col" style={{ gap }}>
          {Array.from({ length: rows }, (_, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/5 motion-safe:animate-pulse"
              style={{ height: ROW_PX }}
            />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="m-auto flex flex-col gap-1 text-center">
          <p className="font-utsaha text-sm text-white">
            No active attestations
          </p>
          <p className="font-utsaha text-xs text-gray-400">
            When someone attests one of these tokens, they show up here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col" style={{ gap }}>
          {shown.map((attester, i) => (
            <AttesterRow
              key={`${attester.tokenId}-${attester.attestation.attesterTokenId}-${i}`}
              attester={attester}
            />
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <>
      {variant === "profile" ? (
        <ProfileCard title={title} action={action}>
          {body}
        </ProfileCard>
      ) : (
        <section className="flex w-full flex-col gap-3 overflow-hidden rounded-2xl border border-card-border bg-card-bg p-5 lg:h-full">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-utsaha text-xl leading-tight text-white md:text-2xl">
              {title}
            </h3>
            {action}
          </div>
          {body}
        </section>
      )}

      {isModalOpen && (
        <WhoAttestedModal
          attesters={attesters}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

function WhoAttestedModal({
  attesters,
  onClose,
}: {
  attesters: TokenAttester[];
  onClose: () => void;
}) {
  const titleId = useId();
  const [activeOnly, setActiveOnly] = useState(true);
  const listed = activeOnly ? attesters.filter(isActive) : attesters;
  const people = new Set(listed.map((a) => a.attestation.attesterTokenId)).size;
  const tokens = new Set(listed.map((a) => a.tokenId)).size;
  const count = (n: number, noun: string) =>
    `${n} ${noun}${n === 1 ? "" : "s"}`;

  return (
    <Modal
      isOpen
      onClose={onClose}
      titleId={titleId}
      title="Who attested"
      subtitle="Who has vouched for these tokens"
      widthClassName="max-w-lg"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-utsaha text-sm text-gray-400">
            {count(listed.length, "attestation")} from{" "}
            {count(people, "attester")} on {count(tokens, "token")}
          </p>
          <ActiveAllToggle activeOnly={activeOnly} onChange={setActiveOnly} />
        </div>

        {listed.length === 0 ? (
          <p className="py-8 text-center font-utsaha text-sm text-gray-400">
            No active attestations.
          </p>
        ) : (
          <ul className="flex max-h-[22rem] flex-col gap-2 overflow-y-auto">
            {listed.map((attester, i) => (
              <AttesterRow
                key={`${attester.tokenId}-${attester.attestation.attesterTokenId}-${i}`}
                attester={attester}
                showWhen
              />
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

function AttesterRow({
  attester,
  showWhen = false,
}: {
  attester: TokenAttester;
  /** Adds how long ago it was given; the modal has room for it. */
  showWhen?: boolean;
}) {
  const { attestation } = attester;
  const status = attestationStatus(attestation);
  const tokenId = formatTokenId(attester.tokenId);
  // A profile token opens the profile; any other token opens its search result.
  const tokenHref =
    tokenTypeOf(attester.tokenId) === TOKEN_TYPE.PROFILE
      ? `/profile?u=${tokenId}`
      : `/discover?q=${tokenId}`;

  return (
    <li
      className={cn(
        "flex shrink-0 flex-col justify-center rounded-xl border border-white/8 bg-white/[0.03] px-3.5",
        status !== "active" && "opacity-60"
      )}
      style={{ height: ROW_PX }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {/* The attester's wallet view, as in the per-token attesters list. */}
          <Link
            href={`/wallet?u=${attestation.attesterAddress}`}
            className="truncate font-utsaha text-sm text-white transition-colors hover:text-brand-blue hover:underline"
          >
            {attester.displayName}
          </Link>
          {status !== "active" && <StatusBadge status={status} />}
        </div>
        <span className="shrink-0 font-utsaha text-xs text-gray-400">
          {formatAttestationLength(attestation)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 font-utsaha text-xs text-gray-400">
        <Link
          href={tokenHref}
          className="flex min-w-0 gap-1 transition-colors hover:text-white"
        >
          <span className="truncate">{attester.tokenName}</span>
          <span className="shrink-0">· {tokenId}</span>
        </Link>
        {showWhen && (
          <span className="shrink-0">
            {formatTimeAgo(attestation.timestamp)}
          </span>
        )}
      </div>
    </li>
  );
}

export default WhoAttested;
