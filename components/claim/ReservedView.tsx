"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TransactionStatus } from "@/components/ui/TransactionStatus";

interface ReservedViewProps {
  name: string | null;
  /** Reserved just now on this page, rather than earlier by this wallet. */
  isNew: boolean;
  txHash?: string;
  onShare: () => void;
}

export function ReservedView({
  name,
  isNew,
  txHash,
  onShare,
}: ReservedViewProps) {
  return (
    <div className="mt-14 flex w-full max-w-lg flex-col items-center text-center md:mt-16">
      <h1 className="font-utsaha text-4xl leading-[1.1] font-normal md:text-6xl">
        <span className="block break-all text-brand-blue">@{name ?? "…"}</span>
        <span className="block text-landhead-text dark:text-landhead-text-dark">
          {isNew ? "is yours." : "is already yours."}
        </span>
      </h1>
      <p className="mt-5 max-w-md font-utsaha text-base leading-relaxed text-gray-600 md:text-lg dark:text-gray-300">
        {isNew
          ? "Your soulbound root identity is live on Sepolia. Share your card and get your friends to claim theirs."
          : "This wallet already holds a root identity. Share your card, or head to your dashboard to build on it."}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onShare}
          disabled={!name}
          className="claim-button-primary"
        >
          Share your card
          <ArrowUpRight size={18} aria-hidden="true" />
        </button>
        <Link href="/dashboard" className="claim-button-secondary">
          Open dashboard
        </Link>
      </div>

      {isNew && (
        <TransactionStatus
          status="success"
          txHash={txHash}
          successMessage={`@${name} is reserved on Sepolia.`}
          className="mt-6 w-full max-w-md text-left"
        />
      )}
    </div>
  );
}

export default ReservedView;
