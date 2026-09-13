"use client";

import React, { useId, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAttestersDetailed } from "@/hooks/useIdentityReads";
import { getEtherscanAddressUrl } from "@/lib/errors";
import { formatExpiry, formatTimeAgo, truncateAddress } from "@/lib/helpers";
import { AttesterView } from "@/lib/types.responses";
import { cn } from "@/lib/utils";

interface AttestersModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: bigint;
  /** Shown in the subtitle so the list is self-describing. */
  tokenName?: string;
}

type Status = "active" | "revoked" | "expired";

function statusOf({ attestation }: AttesterView): Status {
  if (attestation.revokedAt > 0n) return "revoked";
  if (attestation.expiresAt <= BigInt(Math.floor(Date.now() / 1000)))
    return "expired";
  return "active";
}

const STATUS_STYLES: Record<Status, string> = {
  active: "border-brand-green/30 bg-brand-green/10 text-brand-green",
  revoked: "border-red-400/25 bg-red-400/10 text-red-300",
  expired: "border-white/10 bg-white/5 text-gray-400",
};

/**
 * Who has attested a token. Readable by anyone — no wallet required — so a
 * visitor can see who vouched for a profile before trusting it.
 */
export function AttestersModal({
  isOpen,
  onClose,
  tokenId,
  tokenName,
}: AttestersModalProps) {
  const [activeOnly, setActiveOnly] = useState(true);
  const titleId = useId();

  const { data, isLoading, error } = useAttestersDetailed(
    isOpen ? tokenId : undefined,
    activeOnly
  );

  const attesters = useMemo(
    () => ((data?.[0] ?? []) as readonly AttesterView[]).slice(),
    [data]
  );
  const total = Number(data?.[1] ?? 0n);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId={titleId}
      title="Attestations"
      subtitle={
        tokenName
          ? `Who has vouched for “${tokenName}”`
          : "Who has vouched for this token"
      }
      widthClassName="max-w-lg"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-utsaha text-sm text-gray-400">
            {activeOnly ? "Active" : "All"} · {total}
          </p>

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
                onClick={() => setActiveOnly(value)}
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
      </div>
    </Modal>
  );
}

function AttesterRow({ attester }: { attester: AttesterView }) {
  const { attestation } = attester;
  const status = statusOf(attester);
  const wallet = attestation.attesterAddress;

  // `displayName` is the name the wallet chose on its root identity -- the only
  // name this list shows. A profile username is a separate, opt-in thing and is
  // deliberately not surfaced here: every attester has a root identity, but a
  // profile is optional, so a username would be blank for most of this list.
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
          {/* The attester's wallet view, not their profile: this list is about
              who vouched, and their public on-chain holdings are what backs
              that up. `/<address>` is resolved client-side by
              `NotFoundRedirect`, since a static export cannot pre-render a
              route per wallet. */}
          <Link
            href={`/${wallet}`}
            className="truncate font-utsaha text-sm text-white transition-colors hover:text-brand-blue hover:underline"
          >
            {name}
          </Link>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 font-utsaha text-[10px] uppercase",
              STATUS_STYLES[status]
            )}
          >
            {status}
          </span>
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
            ` · expires in ${formatExpiry(attestation.expiresAt)}`}
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

export default AttestersModal;
