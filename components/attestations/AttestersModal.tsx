"use client";

import React, { useId, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAttestersDetailed } from "@/hooks/useIdentityReads";
import { getEtherscanAddressUrl } from "@/lib/errors";
import {
  AttestationStatus,
  NO_EXPIRY_DURATION,
  attestationStatus,
  formatExpiry,
  formatTimeAgo,
  truncateAddress,
} from "@/lib/helpers";
import { AttesterView } from "@/lib/types.responses";
import { cn } from "@/lib/utils";

interface AttestersModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: bigint;
  /** Shown in the subtitle so the list is self-describing. */
  tokenName?: string;
}

const STATUS_STYLES: Record<AttestationStatus, string> = {
  active: "border-brand-green/30 bg-brand-green/10 text-brand-green",
  revoked: "border-red-400/25 bg-red-400/10 text-red-300",
  expired: "border-white/10 bg-white/5 text-gray-400",
};

const PAGE_SIZE = 50n;

export function AttestersModal({
  isOpen,
  onClose,
  tokenId,
  tokenName,
}: AttestersModalProps) {
  const [activeOnly, setActiveOnly] = useState(true);
  const [offset, setOffset] = useState(0n);
  const titleId = useId();

  // Reset offset when the filter or token changes so we always start from page 0.
  const resetOffset = (nextActiveOnly: boolean) => {
    setActiveOnly(nextActiveOnly);
    setOffset(0n);
  };

  const { data, isLoading, error } = useAttestersDetailed(
    isOpen ? tokenId : undefined,
    activeOnly,
    offset,
    PAGE_SIZE
  );

  const attesters = useMemo(
    () => ((data?.[0] ?? []) as readonly AttesterView[]).slice(),
    [data]
  );
  const total = Number(data?.[1] ?? 0n);
  const hasMore = Number(offset) + attesters.length < total;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId={titleId}
      title="Attestations"
      subtitle={
        tokenName
          ? `Who has vouched for "${tokenName}"`
          : "Who has vouched for this token"
      }
      widthClassName="max-w-lg"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-utsaha text-sm text-gray-400">
            {activeOnly ? "Active" : "All"} · {attesters.length}
            {total > attesters.length ? ` of ${total}` : ""}
          </p>

          <ActiveAllToggle activeOnly={activeOnly} onChange={resetOffset} />
        </div>

        <div className="flex max-h-[22rem] flex-col gap-2 overflow-y-auto">
          {error ? (
            <p className="py-8 text-center font-utsaha text-sm text-red-300">
              Couldn&rsquo;t load attestations.
            </p>
          ) : isLoading ? (
            <p className="py-8 text-center font-utsaha text-sm text-gray-400">
              Loading attestations…
            </p>
          ) : attesters.length === 0 ? (
            <p className="py-8 text-center font-utsaha text-sm text-gray-400">
              {activeOnly
                ? "No active attestations yet."
                : "Nobody has attested this token yet."}
            </p>
          ) : (
            attesters.map((attester, index) => (
              <AttesterRow
                key={`${attester.attestation.attesterTokenId}-${index}`}
                attester={attester}
              />
            ))
          )}
        </div>

        {/* Pagination controls — only shown when there are more rows to fetch */}
        {(offset > 0n || hasMore) && (
          <div className="flex items-center justify-between gap-2 border-t border-white/8 pt-3">
            <button
              type="button"
              disabled={offset === 0n || isLoading}
              onClick={() =>
                setOffset((o) => (o >= PAGE_SIZE ? o - PAGE_SIZE : 0n))
              }
              className="rounded-lg px-3 py-1 font-utsaha text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="font-utsaha text-xs text-gray-500">
              {Number(offset) + 1}–{Number(offset) + attesters.length} of{" "}
              {total}
            </span>
            <button
              type="button"
              disabled={!hasMore || isLoading}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
              className="rounded-lg px-3 py-1 font-utsaha text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

function AttesterRow({ attester }: { attester: AttesterView }) {
  const { attestation } = attester;
  const status = attestationStatus(attestation);
  const wallet = attestation.attesterAddress;

  // The root identity name, not the optional profile username.
  const displayName = attester.displayName?.trim();
  const name = displayName || truncateAddress(wallet, 8, 6);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-white/8 px-3.5 py-3",
        status !== "active" && "opacity-60"
      )}
      style={{ backgroundColor: "var(--color-modal-inner-bg)" }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {/* The attester's wallet view, not their profile. */}
          <Link
            href={`/wallet?u=${wallet}`}
            className="truncate font-utsaha text-sm text-white transition-colors hover:text-brand-blue hover:underline"
          >
            {name}
          </Link>
          <StatusBadge status={status} />
        </div>

        <p className="truncate font-utsaha text-xs text-gray-400">
          {displayName && (
            <span className="font-mono">
              {truncateAddress(wallet)}
              {" · "}
            </span>
          )}
          {formatTimeAgo(attestation.timestamp)}
          {status === "active" &&
            (attestation.expiresAt >= NO_EXPIRY_DURATION
              ? " · never expires"
              : ` · expires in ${formatExpiry(attestation.expiresAt)}`)}
        </p>
      </div>

      <a
        href={getEtherscanAddressUrl(wallet)}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        aria-label={`View ${name} on Etherscan`}
      >
        <ExternalLink size={15} />
      </a>
    </div>
  );
}

/** The Active / All switch, shared with the "Who attested" modal. */
export function ActiveAllToggle({
  activeOnly,
  onChange,
}: {
  activeOnly: boolean;
  onChange: (activeOnly: boolean) => void;
}) {
  return (
    <div className="flex rounded-lg border border-white/10 p-0.5">
      {(
        [
          ["Active", true],
          ["All", false],
        ] as const
      ).map(([label, value]) => (
        <button
          key={label}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={activeOnly === value}
          className={cn(
            "rounded-md px-3 py-1 font-utsaha text-xs transition-colors",
            activeOnly === value
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:text-white"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: AttestationStatus }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2 py-0.5 font-utsaha text-[10px] uppercase",
        STATUS_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}

export default AttestersModal;
