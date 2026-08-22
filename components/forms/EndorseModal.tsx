"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useEndorseToken, useCreateRootIdentity } from "@/hooks/useIdentityWrites";
import { useIdentityGate } from "@/hooks/useIdentityGate";
import { useTokenOwner } from "@/hooks/useIdentityReads";
import { EndorseModalProps, TxStatus } from "@/lib/types";
import {
  TransactionStatus,
} from "@/components/ui/TransactionStatus";

/** Duration presets in seconds */
const DURATION_PRESETS = [
  { label: "30 Days", seconds: 30n * 24n * 60n * 60n },
  { label: "90 Days", seconds: 90n * 24n * 60n * 60n },
  { label: "180 Days", seconds: 180n * 24n * 60n * 60n },
  { label: "1 Year", seconds: 365n * 24n * 60n * 60n },
] as const;

export function EndorseModal({
  isOpen,
  onClose,
  tokenId,
  tokenName,
  onSuccess,
}: EndorseModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<number>(1); // default: 90 days
  const [customDays, setCustomDays] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const { address, rootId } = useIdentityGate();
  const { data: ownerAddress } = useTokenOwner(tokenId);

  const endorseToken = useEndorseToken();
  const createRoot = useCreateRootIdentity();

  const isSelfToken = !!address && !!ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase();
  const hasNoRootIdentity = !rootId || rootId === 0n;

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedPreset(1);
      setCustomDays("");
      setUseCustom(false);
      endorseToken.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Auto-close on success
  useEffect(() => {
    if (endorseToken.isSuccess) {
      const timer = setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endorseToken.isSuccess]);

  if (!isOpen) return null;

  const getDurationSeconds = (): bigint => {
    if (useCustom && customDays) {
      return BigInt(Math.floor(Number(customDays))) * 24n * 60n * 60n;
    }
    return DURATION_PRESETS[selectedPreset].seconds;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = getDurationSeconds();
    if (duration <= 0n) return;
    endorseToken.write(tokenId, duration);
  };

  const getTxStatus = (): TxStatus => {
    if (endorseToken.isPending) return "pending";
    if (endorseToken.isConfirming) return "confirming";
    if (endorseToken.isSuccess) return "success";
    if (endorseToken.error) return "error";
    return "idle";
  };

  const txStatus = getTxStatus();
  const isSubmitting = txStatus === "pending" || txStatus === "confirming";

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200"
      onClick={onClose}
    >
      <div
        className="animate-in zoom-in-95 relative w-full max-w-md rounded-2xl p-6 shadow-2xl duration-200 md:p-8"
        style={{
          backgroundColor: "var(--color-app-bg)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="font-utsaha text-2xl text-white">Endorse Token</h2>
          {tokenName && (
            <p className="mt-1 font-utsaha text-sm text-gray-400">
              Endorsing &ldquo;{tokenName}&rdquo; (#{tokenId.toString()})
            </p>
          )}
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Duration presets */}
          <div className="flex flex-col gap-2">
            <label className="font-utsaha text-sm text-gray-300">
              Endorsement Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_PRESETS.map((preset, i) => (
                <button
                  key={preset.label}
                  type="button"
                  disabled={isSubmitting}
                  className={`rounded-lg px-3 py-2 font-utsaha text-sm transition-all ${!useCustom && selectedPreset === i
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
              className={`w-fit font-utsaha text-xs transition-colors ${useCustom ? "text-brand-blue" : "text-gray-500 hover:text-gray-300"
                }`}
              onClick={() => setUseCustom(!useCustom)}
            >
              {useCustom ? "▼ Custom Duration" : "▸ Custom Duration"}
            </button>

            {useCustom && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="Number of days"
                  min={1}
                  className="w-full rounded-lg px-4 py-2 font-utsaha text-white placeholder-gray-500 transition-all focus:ring-1 focus:ring-brand-blue focus:outline-none"
                  style={{
                    backgroundColor: "var(--color-modal-inner-bg)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  disabled={isSubmitting}
                />
                <span className="font-utsaha text-sm text-gray-400">days</span>
              </div>
            )}
          </div>

          {/* Validation Warnings */}
          {isSelfToken && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-center font-utsaha text-sm text-amber-400">
              ⚠️ You cannot endorse a token owned by your wallet.
            </div>
          )}

          {hasNoRootIdentity && !isSelfToken && (
            <div className="flex flex-col gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-center font-utsaha text-sm text-blue-300">
              <p>ℹ️ You need a Root Identity before you can endorse tokens on-chain.</p>
              <button
                type="button"
                onClick={() => createRoot.write("")}
                disabled={createRoot.isLoading}
                className="mt-1 w-full rounded-md bg-brand-blue py-1.5 font-utsaha text-xs text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {createRoot.isLoading ? "Initializing Root Identity…" : "Initialize Root Identity"}
              </button>
              {createRoot.isSuccess && (
                <p className="text-xs text-brand-green">Root Identity created! You can now endorse.</p>
              )}
            </div>
          )}

          {/* Transaction Status */}
          <TransactionStatus
            status={txStatus}
            txHash={endorseToken.txHash}
            error={endorseToken.error}
            successMessage="Endorsement given successfully!"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !address || isSelfToken || hasNoRootIdentity}
            className="w-full rounded-lg bg-brand-green py-2.5 font-utsaha text-black transition-all hover:bg-brand-green/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Endorsing…" : "Endorse"}
          </button>
        </form>
      </div>
    </div>
  );
}
