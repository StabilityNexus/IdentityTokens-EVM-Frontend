"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { AttestModal } from "@/components/forms/AttestModal";
import { ConfirmTxModal } from "@/components/forms/ConfirmTxModal";
import { useHasAttested, useRootId } from "@/hooks/useIdentityReads";
import { useFlagToken, useRevokeAttestation } from "@/hooks/useIdentityWrites";
import { getContractErrorMessage } from "@/lib/errors";
import { TokenMenu } from "./TokenMenu";

// Attest, or Revoke while the viewer's attestation is live, plus the ⋮ menu
export function TokenActions({
  tokenId,
  name,
  owner,
  type,
  attestations,
}: {
  tokenId: bigint;
  name: string;
  owner?: string;
  type?: string;
  attestations?: number;
}) {
  const { address, isConnected } = useAccount();
  const { data: rootId } = useRootId(address);
  const { data: hasAttested, refetch: refetchAttested } = useHasAttested(
    rootId ? rootId : undefined,
    tokenId
  );
  const revoke = useRevokeAttestation();
  const flag = useFlagToken();
  const [isAttestOpen, setIsAttestOpen] = useState(false);
  const [confirming, setConfirming] = useState<"revoke" | "flag" | null>(null);

  useEffect(() => {
    if (!revoke.isSuccess) return;
    refetchAttested();
  }, [revoke.isSuccess, refetchAttested]);

  const isOwner =
    !!address && !!owner && address.toLowerCase() === owner.toLowerCase();
  const busy = revoke.isLoading || flag.isLoading;
  const error = revoke.error ?? flag.error;
  const status = error
    ? getContractErrorMessage(error)
    : revoke.isLoading
      ? "Revoking…"
      : flag.isLoading
        ? "Flagging…"
        : revoke.isSuccess
          ? "Attestation revoked"
          : flag.isSuccess
            ? "Flagged"
            : null;

  return (
    <>
      {isOwner ? (
        <span className="font-utsaha text-xs text-gray-500">Yours</span>
      ) : !isConnected ? null : hasAttested ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            flag.reset();
            revoke.reset();
            setConfirming("revoke");
          }}
          className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1.5 font-utsaha text-xs text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50 sm:px-3 sm:text-sm"
        >
          Revoke
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            revoke.reset();
            flag.reset();
            setIsAttestOpen(true);
          }}
          className="rounded-lg bg-brand-blue px-2 py-1.5 font-utsaha text-xs text-white transition-all hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 sm:px-3 sm:text-sm"
        >
          Attest
        </button>
      )}

      <TokenMenu
        tokenId={tokenId}
        name={name}
        type={type}
        attestations={attestations}
        isOwner={isOwner}
        onFlag={
          isConnected && !isOwner
            ? () => {
                revoke.reset();
                flag.reset();
                setConfirming("flag");
              }
            : undefined
        }
        flagDisabled={busy || flag.isSuccess}
      />

      {status && (
        <span
          className={`w-full font-utsaha text-xs sm:w-auto ${error ? "text-red-400" : "text-gray-400"}`}
        >
          {status}
        </span>
      )}

      {isAttestOpen && (
        <AttestModal
          isOpen
          onClose={() => setIsAttestOpen(false)}
          tokenId={tokenId}
          tokenName={name}
          onSuccess={() => refetchAttested()}
        />
      )}

      {confirming === "revoke" && (
        <ConfirmTxModal
          title="Revoke attestation"
          description={`Withdraw your attestation of “${name}”. It stops counting toward this token’s trust.`}
          confirmLabel="Revoke"
          tone="red"
          onConfirm={(donate) => revoke.write(tokenId, donate)}
          onClose={() => setConfirming(null)}
        />
      )}

      {confirming === "flag" && (
        <ConfirmTxModal
          title="Flag / Report"
          description={`Report “${name}” as untrustworthy. Flags are public and can’t be undone.`}
          confirmLabel="Flag"
          tone="yellow"
          onConfirm={(donate) => flag.write(tokenId, donate)}
          onClose={() => setConfirming(null)}
        />
      )}
    </>
  );
}
