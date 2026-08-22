"use client";

import React from "react";
import { getContractErrorMessage, getEtherscanTxUrl } from "@/lib/errors";
import { TransactionStatusProps, TxStatus } from "@/lib/types";

/**
 * Inline transaction status indicator for modals and action buttons.
 * Shows the current state of a blockchain transaction with Etherscan links.
 */
export function TransactionStatus({
  status,
  txHash,
  error,
  successMessage = "Transaction confirmed!",
  className = "",
}: TransactionStatusProps) {
  if (status === "idle") return null;

  return (
    <div
      className={`rounded-lg p-3 font-utsaha text-sm ${className}`}
      style={{
        backgroundColor:
          status === "error"
            ? "rgba(239, 68, 68, 0.1)"
            : status === "success"
              ? "rgba(99, 252, 159, 0.1)"
              : "rgba(5, 83, 253, 0.1)",
        border: `1px solid ${
          status === "error"
            ? "rgba(239, 68, 68, 0.2)"
            : status === "success"
              ? "rgba(99, 252, 159, 0.2)"
              : "rgba(5, 83, 253, 0.2)"
        }`,
      }}
    >
      <div className="flex items-center gap-2">
        {/* Status indicator */}
        {status === "pending" && (
          <>
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
            <span className="text-brand-blue">Waiting for wallet confirmation…</span>
          </>
        )}

        {status === "confirming" && (
          <>
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
            <span className="text-brand-blue">Confirming on-chain…</span>
          </>
        )}

        {status === "success" && (
          <>
            <span className="text-brand-green">✓</span>
            <span className="text-brand-green">{successMessage}</span>
          </>
        )}

        {status === "error" && (
          <>
            <span className="text-red-400">✕</span>
            <span className="text-red-400">
              {getContractErrorMessage(error)}
            </span>
          </>
        )}
      </div>

      {/* Etherscan link */}
      {txHash && (status === "confirming" || status === "success") && (
        <a
          href={getEtherscanTxUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-block text-xs text-brand-blue underline transition-opacity hover:opacity-80"
        >
          View on Etherscan ↗
        </a>
      )}
    </div>
  );
}
