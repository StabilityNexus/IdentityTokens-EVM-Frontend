"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronDown } from "lucide-react";
import { useBurnToken, useTransferToken } from "@/hooks/useIdentityWrites";
import { useIdentityGate } from "@/hooks/useIdentityGate";
import { TokenFormProps, TxStatus } from "@/lib/types";
import { TransactionStatus } from "@/components/ui/TransactionStatus";

export function TokenForm({
  isOpen,
  onClose,
  tokenName = "Token Name",
  tokenId,
  onSuccess,
}: TokenFormProps) {
  const [transferAddress, setTransferAddress] = useState("");
  const [showTransfer, setShowTransfer] = useState(false);
  const [showBurnConfirm, setShowBurnConfirm] = useState(false);
  const [action, setAction] = useState<"idle" | "burning" | "transferring">(
    "idle"
  );

  const { refetchWalletTokens } = useIdentityGate();
  const burnToken = useBurnToken();
  const transferToken = useTransferToken();

  // Reset on close. Clearing this from an effect is the trade-off for the
  // parent owning `isOpen`; the effect-free fix is to remount the modal on
  // close (a `key`, or an inner component) rather than gate it on a prop.
  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTransferAddress("");
      setShowTransfer(false);
      setShowBurnConfirm(false);
      setAction("idle");
      burnToken.reset();
      transferToken.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Auto-close on success
  useEffect(() => {
    if (
      (action === "burning" && burnToken.isSuccess) ||
      (action === "transferring" && transferToken.isSuccess)
    ) {
      refetchWalletTokens();
      const timer = setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, burnToken.isSuccess, transferToken.isSuccess]);

  if (!isOpen || tokenId === undefined) return null;

  const handleBurn = () => {
    if (!showBurnConfirm) {
      setShowBurnConfirm(true);
      return;
    }
    setAction("burning");
    burnToken.write(tokenId);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAddress.startsWith("0x") || transferAddress.length !== 42) {
      return;
    }
    setAction("transferring");
    transferToken.write(tokenId, transferAddress as `0x${string}`);
  };

  const getTxStatus = (): TxStatus => {
    if (action === "burning") {
      if (burnToken.isPending) return "pending";
      if (burnToken.isConfirming) return "confirming";
      if (burnToken.isSuccess) return "success";
      if (burnToken.error) return "error";
    }
    if (action === "transferring") {
      if (transferToken.isPending) return "pending";
      if (transferToken.isConfirming) return "confirming";
      if (transferToken.isSuccess) return "success";
      if (transferToken.error) return "error";
    }
    return "idle";
  };

  const txStatus = getTxStatus();
  const isSubmitting = txStatus === "pending" || txStatus === "confirming";
  const currentError =
    action === "burning" ? burnToken.error : transferToken.error;
  const currentTxHash =
    action === "burning" ? burnToken.txHash : transferToken.txHash;

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200"
      onClick={onClose}
    >
      <div
        className="animate-in zoom-in-95 relative w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl duration-200 md:max-w-2xl"
        style={{
          backgroundColor: "var(--color-app-bg)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 pt-6 pb-5">
          {/* Title + dropdown */}
          <button
            type="button"
            className="flex min-w-0 cursor-pointer items-center gap-2 font-utsaha text-lg leading-tight text-white transition-opacity hover:opacity-80"
          >
            <span className="max-w-[260px] truncate md:max-w-sm">
              {tokenName} /{" "}
              <span className="text-base text-gray-400">
                #{tokenId.toString()}
              </span>
            </span>
            <ChevronDown size={20} className="shrink-0 text-gray-400" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="ml-4 shrink-0 rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col gap-4 px-6 py-5">
          {/* Transfer section (collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setShowTransfer(!showTransfer)}
              className="font-utsaha text-sm text-gray-400 transition-colors hover:text-white"
              disabled={isSubmitting}
            >
              {showTransfer ? "▼ Transfer Token" : "▸ Transfer Token"}
            </button>

            {showTransfer && (
              <form
                onSubmit={handleTransfer}
                className="mt-3 flex flex-col gap-3"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="font-utsaha text-sm text-gray-300">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={transferAddress}
                    onChange={(e) => setTransferAddress(e.target.value)}
                    placeholder="0x..."
                    disabled={isSubmitting}
                    className="w-full rounded-lg px-4 py-2 font-utsaha text-white placeholder-gray-500 transition-all focus:ring-1 focus:ring-brand-blue focus:outline-none disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--color-modal-inner-bg)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !transferAddress.startsWith("0x") ||
                    transferAddress.length !== 42
                  }
                  className="w-full rounded-lg bg-brand-blue py-2 font-utsaha text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {action === "transferring" && isSubmitting
                    ? "Transferring…"
                    : "Transfer"}
                </button>
              </form>
            )}
          </div>

          {/* Transaction Status */}
          <TransactionStatus
            status={txStatus}
            txHash={currentTxHash}
            error={currentError}
            successMessage={
              action === "burning"
                ? "Token burned permanently!"
                : "Token transferred successfully!"
            }
          />

          {/* ── Action buttons ── */}
          <div className="mt-2 flex items-center gap-3">
            {/* Burn */}
            <button
              type="button"
              onClick={handleBurn}
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2.5 rounded-lg py-2.5 font-utsaha text-base text-black transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: showBurnConfirm
                  ? "var(--color-border-error)"
                  : "var(--color-text-red)",
              }}
            >
              <Image
                src="/assets/trash.svg"
                alt="burn"
                width={20}
                height={20}
              />
              {showBurnConfirm
                ? action === "burning" && isSubmitting
                  ? "Burning…"
                  : "Confirm Burn"
                : "Burn"}
            </button>
          </div>

          {showBurnConfirm && !isSubmitting && (
            <p className="text-center font-utsaha text-xs text-red-400">
              ⚠ This action is permanent and cannot be undone.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
