"use client";

import React, { useState, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import {
  useAttestToken,
  useCreateRootIdentity,
} from "@/hooks/useIdentityWrites";
import { useIdentityGate } from "@/hooks/useIdentityGate";
import { useTokenOwner } from "@/hooks/useIdentityReads";
import { AttestModalProps, TxStatus } from "@/lib/types";
import { TransactionStatus } from "@/components/ui/TransactionStatus";
import { truncateAddress } from "@/lib/helpers";

/** Duration presets in seconds */
const DURATION_PRESETS = [
  { label: "30 Days", seconds: 30n * 24n * 60n * 60n },
  { label: "90 Days", seconds: 90n * 24n * 60n * 60n },
  { label: "180 Days", seconds: 180n * 24n * 60n * 60n },
  { label: "1 Year", seconds: 365n * 24n * 60n * 60n },
] as const;

/** The contract has no exposed maximum, so only the lower bound is enforced. */
const MIN_DURATION_DAYS = 1;

export function AttestModal({
  isOpen,
  onClose,
  tokenId,
  tokenName,
  onSuccess,
}: AttestModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<number>(1); // default: 90 days
  const [customDays, setCustomDays] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const { address, rootId } = useIdentityGate();
  const { data: ownerAddress } = useTokenOwner(tokenId);

  const attestToken = useAttestToken();
  const createRoot = useCreateRootIdentity();

  const isSelfToken =
    !!address &&
    !!ownerAddress &&
    address.toLowerCase() === ownerAddress.toLowerCase();
  const hasNoRootIdentity = !rootId || rootId === 0n;

  const titleId = useId();
  const durationLabelId = `${titleId}-duration`;
  const customDaysId = `${titleId}-custom-days`;
  const customDaysErrorId = `${titleId}-custom-days-error`;

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  // Escape to dismiss, plus focus management: pull focus into the dialog, keep
  // Tab cycling inside it, and hand focus back to the opener on close.
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((element) => element.getClientRects().length > 0);

    const initial = focusable();
    const firstField = initial.find((element) =>
      ["INPUT", "SELECT", "TEXTAREA"].includes(element.tagName)
    );
    (firstField ?? initial[0])?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const cycle = focusable();
      if (cycle.length === 0) return;

      const first = cycle[0];
      const last = cycle[cycle.length - 1];
      const active = document.activeElement;
      const escaped = !dialogRef.current?.contains(active);

      if (event.shiftKey && (active === first || escaped)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || escaped)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  // Auto-close on success
  useEffect(() => {
    if (attestToken.isSuccess) {
      const timer = setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attestToken.isSuccess]);

  if (!isOpen) return null;

  /** Why the custom duration cannot be submitted, if it cannot. */
  const customDaysError = (): string | undefined => {
    if (!useCustom) return undefined;
    if (!customDays.trim()) return "Enter a number of days.";
    const days = Number(customDays);
    if (!Number.isFinite(days) || !Number.isInteger(days)) {
      return "Enter a whole number of days.";
    }
    if (days < MIN_DURATION_DAYS) {
      return `Attest for at least ${MIN_DURATION_DAYS} day.`;
    }
    return undefined;
  };

  const durationError = customDaysError();

  const getDurationSeconds = (): bigint => {
    // Number() first: the field accepts forms like "2e1" that BigInt rejects.
    if (useCustom) return BigInt(Number(customDays)) * 24n * 60n * 60n;
    return DURATION_PRESETS[selectedPreset].seconds;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Previously a custom value of 0 or below fell through to a silent return.
    if (durationError) return;
    attestToken.write(tokenId, getDurationSeconds());
  };

  const getTxStatus = (): TxStatus => {
    if (attestToken.isPending) return "pending";
    if (attestToken.isConfirming) return "confirming";
    if (attestToken.isSuccess) return "success";
    if (attestToken.error) return "error";
    return "idle";
  };

  const txStatus = getTxStatus();
  const isSubmitting = txStatus === "pending" || txStatus === "confirming";

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-in zoom-in-95 relative w-full max-w-md rounded-2xl p-6 shadow-2xl duration-200 md:p-8"
        style={{
          backgroundColor: "var(--color-app-bg)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 id={titleId} className="font-utsaha text-2xl text-white">
            Attest Token
          </h2>
          {tokenName && (
            <p className="mt-1 font-utsaha text-sm text-gray-400">
              Attesting &ldquo;{tokenName}&rdquo; (#{tokenId.toString()})
            </p>
          )}
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Duration presets */}
          <div
            className="flex flex-col gap-2"
            role="group"
            aria-labelledby={durationLabelId}
          >
            <span
              id={durationLabelId}
              className="font-utsaha text-sm text-gray-300"
            >
              Attestation Duration
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_PRESETS.map((preset, i) => (
                <button
                  key={preset.label}
                  type="button"
                  disabled={isSubmitting}
                  className={`rounded-lg px-3 py-2 font-utsaha text-sm transition-all ${
                    !useCustom && selectedPreset === i
                      ? "bg-brand-blue text-white"
                      : "bg-modal-inner-bg text-gray-400 hover:bg-modal-border hover:text-white"
                  }`}
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  onClick={() => {
                    setSelectedPreset(i);
                    setUseCustom(false);
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom duration */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              className={`w-fit font-utsaha text-xs transition-colors ${
                useCustom
                  ? "text-brand-blue"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => setUseCustom(!useCustom)}
            >
              {useCustom ? "▼ Custom Duration" : "▸ Custom Duration"}
            </button>

            {useCustom && (
              <>
                <div className="flex items-center gap-2">
                  <input
                    id={customDaysId}
                    type="number"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    placeholder="Number of days"
                    min={MIN_DURATION_DAYS}
                    aria-label="Custom duration in days"
                    aria-invalid={!!durationError}
                    aria-describedby={
                      durationError ? customDaysErrorId : undefined
                    }
                    className="w-full rounded-lg px-4 py-2 font-utsaha text-white placeholder-gray-500 transition-all focus:ring-1 focus:ring-brand-blue focus:outline-none"
                    style={{
                      backgroundColor: "var(--color-modal-inner-bg)",
                      border: durationError
                        ? "1px solid rgba(239,68,68,0.55)"
                        : "1px solid rgba(255,255,255,0.08)",
                    }}
                    disabled={isSubmitting}
                  />
                  <span className="font-utsaha text-sm text-gray-400">
                    days
                  </span>
                </div>
                {durationError && (
                  <span
                    id={customDaysErrorId}
                    className="font-utsaha text-xs text-red-400"
                  >
                    {durationError}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Validation Warnings */}
          {isSelfToken && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-center font-utsaha text-sm text-amber-400">
              ⚠️ You cannot attest a token owned by your wallet.
            </div>
          )}

          {hasNoRootIdentity && !isSelfToken && (
            <div className="flex flex-col gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-center font-utsaha text-sm text-blue-300">
              <p>
                ℹ️ You need a Root Identity before you can attest tokens
                on-chain.
              </p>
              <button
                type="button"
                onClick={() =>
                  address && createRoot.write(truncateAddress(address))
                }
                disabled={createRoot.isLoading || !address}
                className="mt-1 w-full rounded-md bg-brand-blue py-1.5 font-utsaha text-xs text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {createRoot.isLoading
                  ? "Initializing Root Identity…"
                  : "Initialize Root Identity"}
              </button>
              {createRoot.isSuccess && (
                <p className="text-xs text-brand-green">
                  Root Identity created! You can now attest.
                </p>
              )}
            </div>
          )}

          {/* Transaction Status */}
          <TransactionStatus
            status={txStatus}
            txHash={attestToken.txHash}
            error={attestToken.error}
            successMessage="Attestation given successfully!"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !address ||
              isSelfToken ||
              hasNoRootIdentity ||
              !!durationError
            }
            className="w-full rounded-lg bg-brand-green py-2.5 font-utsaha text-black transition-all hover:bg-brand-green/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Attesting…" : "Attest"}
          </button>
        </form>
      </div>
    </div>
  );
}
