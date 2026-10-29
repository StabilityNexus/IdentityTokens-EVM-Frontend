"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { TokenActions } from "./TokenActions";
import { TokenMenu } from "./TokenMenu";
import { TokenCardProps } from "@/lib/types";
import { parseTokenId } from "@/lib/tokenId";
import { truncateAddress } from "@/lib/helpers";

export function TokenCard({
  variant,
  tokenId,
  name,
  type,
  expiresIn,
  attestations = 0,
  onViewAll,
  readOnly = false,
  owner,
}: TokenCardProps) {
  const id = parseTokenId(tokenId)!;

  // No backdrop-filter or transform on the card: either would trap the
  // fixed-position modals its menu opens inside the card.
  return (
    <div className="group relative flex min-h-[75px] w-full flex-col gap-3 rounded-[16px] border border-card-border bg-card-bg p-3 transition-all duration-300 hover:border-white/20 sm:gap-4 sm:p-4 md:px-6 xl:grid xl:grid-cols-12 xl:items-center xl:gap-4">
      {/* --- Name & ID --- */}
      <div className="flex min-w-0 flex-col xl:col-span-3">
        <h3 className="truncate font-utsaha text-lg leading-tight text-white">
          {name}
        </h3>
        {owner && (
          <Link
            href={`/wallet?u=${owner}`}
            title={owner}
            className="w-fit truncate font-utsaha text-sm text-brand-blue-link hover:underline"
          >
            Owned by {truncateAddress(owner)}
          </Link>
        )}
        <p className="truncate font-utsaha text-sm text-gray-500">
          ID: {tokenId}
        </p>
      </div>

      {/* --- Type Badge --- */}
      <div className="flex items-center xl:col-span-3 xl:justify-start">
        <div className="flex w-fit max-w-full items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5">
          <ShieldCheck size={16} className="shrink-0 text-brand-blue" />
          <span className="truncate font-utsaha text-sm text-gray-300">
            {type}
          </span>
        </div>
      </div>

      {/* --- Expiry --- */}
      <div className="flex items-center font-utsaha text-sm whitespace-nowrap text-gray-400 xl:col-span-2 xl:justify-start">
        Expires in: <span className="ml-1 text-gray-200">{expiresIn}</span>
      </div>

      {/* --- Variant Specific Actions --- */}
      <div className="flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-3 border-t border-card-border pt-4 xl:col-span-4 xl:justify-end xl:border-none xl:pt-0">
        {/* HOME Variant: the wallet's own tokens, or someone else's when readOnly */}
        {variant === "home" && (
          <>
            <div className="flex shrink-0 items-center gap-2 font-utsaha text-sm whitespace-nowrap text-gray-400">
              <span className="text-white">{attestations}</span>
              <span className="hidden xs:inline">Attestations</span>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button
                onClick={onViewAll}
                className="px-1 font-utsaha text-sm whitespace-nowrap text-brand-blue transition-colors hover:text-blue-400 sm:px-2"
              >
                View All
              </button>
              <TokenMenu
                tokenId={id}
                name={name}
                type={type}
                attestations={attestations}
                isOwner={!readOnly}
              />
            </div>
          </>
        )}

        {/* DISCOVER Variant: anyone's token, actions depend on the viewer */}
        {variant === "discover" && (
          <div className="flex w-full items-center justify-between sm:justify-end sm:gap-4">
            <div className="flex shrink-0 items-center gap-2 font-utsaha text-sm whitespace-nowrap text-gray-400">
              <span className="font-medium text-white">{attestations}</span>
              <span className="hidden xs:inline">Attestations</span>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
              <button
                onClick={onViewAll}
                className="px-1 font-utsaha text-xs font-bold text-brand-blue transition-colors hover:text-blue-400 sm:px-2 sm:text-sm"
              >
                View
              </button>
              <TokenActions
                tokenId={id}
                name={name}
                owner={owner}
                type={type}
                attestations={attestations}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
