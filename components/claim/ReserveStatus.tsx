"use client";

import React from "react";
import { TransactionStatus } from "@/components/ui/TransactionStatus";
import { CLAIM_CHAIN, SEPOLIA_FAUCET_URL } from "@/lib/claim";
import { getContractErrorMessage } from "@/lib/errors";
import { TxStatus } from "@/lib/types";

interface ReserveStatusProps {
  switchError: unknown;
  txStatus: TxStatus;
  txHash?: string;
  txError?: unknown;
  /** Only while a name is available and nothing is in flight. */
  showHints: boolean;
  onWrongChain: boolean;
  needsGas: boolean;
}

export function ReserveStatus({
  switchError,
  txStatus,
  txHash,
  txError,
  showHints,
  onWrongChain,
  needsGas,
}: ReserveStatusProps) {
  const showTx =
    txStatus === "pending" || txStatus === "confirming" || txStatus === "error";

  return (
    <div className="flex w-full max-w-md flex-col gap-2 font-utsaha text-xs">
      {switchError != null && (
        <p className="text-red-600 dark:text-red-400">
          Couldn&rsquo;t switch to {CLAIM_CHAIN.name}:{" "}
          {getContractErrorMessage(switchError)}
        </p>
      )}

      {showTx && (
        <TransactionStatus
          status={txStatus}
          txHash={txHash}
          error={txError}
          className="text-left"
        />
      )}

      {showHints && (onWrongChain || needsGas) && (
        <p className="text-amber-700 dark:text-text-warning">
          {onWrongChain &&
            `Your wallet will switch to ${CLAIM_CHAIN.name} first. `}
          {needsGas && (
            <>
              You need a little Sepolia ETH for gas.{" "}
              <a
                href={SEPOLIA_FAUCET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:opacity-80"
              >
                Get some free from a faucet ↗
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}

export default ReserveStatus;
