"use client";

import React from "react";
import { TokenCard } from "../cards/TokenCard";
import { TokenListProps } from "@/lib/types";
import { getCardVariant, getSectionTitle } from "@/lib/helpers";

export function TokenList({
  variant,
  tokens,
  className = "",
  onRevoke,
  onEndorse,
  onViewAll,
}: TokenListProps) {
  const cardVariant = getCardVariant(variant);
  const title = getSectionTitle(variant);

  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border border-card-border bg-card-bg p-4 sm:p-6 ${className}`}
    >
      {/* Section Title */}
      <h2 className="mb-5 font-utsaha text-xl text-white md:mb-6 md:text-2xl">
        {title}
      </h2>

      {/* Token Cards */}
      <div className="flex flex-col gap-3">
        {tokens.length === 0 ? (
          <div className="flex items-center justify-center py-12 font-utsaha text-lg text-gray-500">
            No tokens found.
          </div>
        ) : (
          tokens.map((token) => (
            <TokenCard
              key={token.tokenId}
              variant={cardVariant}
              tokenId={token.tokenId}
              name={token.name}
              type={token.type}
              expiresIn={token.expiresIn}
              endorsements={token.endorsements}
              historyAction={token.historyAction}
              actionWalletId={token.actionWalletId}
              onRevoke={onRevoke ? () => onRevoke(token.tokenId) : undefined}
              onEndorse={onEndorse ? () => onEndorse(token.tokenId) : undefined}
              onViewAll={onViewAll ? () => onViewAll(token.tokenId) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TokenList;
