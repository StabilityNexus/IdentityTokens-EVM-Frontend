"use client";

import React from "react";
import {
  MoreVertical,
  Copy,
  Share2,
  Flag,
  AlertTriangle,
  ShieldCheck,
  Edit,
  Flame,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Badge from "../Badge";
import { TokenForm } from "../forms/TokenForm";
import { TokenCardProps, TokenCardVariant } from "@/lib/types";

const getRankFromAttestations = (count: number) => {
  if (count >= 250) return "champion";
  if (count >= 100) return "diamond";
  if (count >= 50) return "platinum";
  if (count >= 25) return "gold";
  if (count >= 10) return "silver";
  return "bronze";
};

export function TokenCard({
  variant,
  tokenId,
  name,
  type,
  expiresIn,
  attestations = 0,
  historyAction = "attested",
  actionWalletId = "0x000...000",
  onRevoke,
  onAttest,
  onViewAll,
}: TokenCardProps) {
  const rank = getRankFromAttestations(attestations);
  const [isTokenFormOpen, setIsTokenFormOpen] = React.useState(false);

  return (
    <>
      <div className="group relative flex min-h-[75px] w-full flex-col gap-3 rounded-[16px] border border-card-border bg-card-bg p-3 backdrop-blur-[2.5px] transition-all duration-300 hover:border-white/20 sm:gap-4 sm:p-4 md:px-6 xl:grid xl:grid-cols-12 xl:items-center xl:gap-4">
        {/* --- Name & ID --- */}
        <div className="flex min-w-0 flex-col xl:col-span-3">
          <h3 className="truncate font-utsaha text-lg leading-tight text-white">
            {name}
          </h3>
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
          {/* HOME Variant */}
          {variant === "home" && (
            <>
              <div className="flex shrink-0 items-center gap-2 font-utsaha text-sm whitespace-nowrap text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Badge rank={rank} size={20} />
                  <span className="text-white">{attestations}</span>
                </div>
                <span className="hidden xs:inline">Attestations</span>
              </div>
              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <button
                  onClick={onViewAll}
                  className="px-1 font-utsaha text-sm whitespace-nowrap text-brand-blue transition-colors hover:text-blue-400 sm:px-2"
                >
                  View All
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 text-gray-500 transition-colors outline-none hover:text-white">
                      <MoreVertical size={20} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 border-card-inner-bg bg-app-bg font-utsaha text-white"
                  >
                    <DropdownMenuItem className="cursor-pointer gap-2 hover:bg-white/10 focus:bg-white/5 focus:text-white">
                      <Share2 size={16} />
                      <span>Share Token</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer gap-2 hover:bg-white/10 focus:bg-white/5 focus:text-white">
                      <Copy size={16} />
                      <span>Copy ID</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 hover:bg-white/10 focus:bg-white/5 focus:text-white"
                      onClick={() => setIsTokenFormOpen(true)}
                    >
                      <Edit size={16} />
                      <span>Edit Token</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer gap-2 text-red-400 hover:bg-white/10 focus:bg-white/5 focus:text-red-400">
                      <Flame size={16} />
                      <span>Burn Token</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}

          {/* HISTORY Variant */}
          {variant === "history" && (
            <>
              <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 font-utsaha text-sm whitespace-nowrap">
                <span className="font-mono text-xs tracking-wide text-gray-400 sm:text-sm">
                  {actionWalletId}
                </span>

                {historyAction === "revoked" && (
                  <span className="text-red-500">Revoked</span>
                )}
                {historyAction === "flagged" && (
                  <span className="flex items-center gap-1 text-red-500">
                    <AlertTriangle size={14} />
                    Flagged
                  </span>
                )}
                {historyAction === "attested" && (
                  <span className="text-white">Attestation received</span>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="shrink-0 p-1 text-gray-500 transition-colors outline-none hover:text-white">
                    <MoreVertical size={20} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 border-card-inner-bg bg-app-bg font-utsaha text-white"
                >
                  <DropdownMenuItem className="cursor-pointer gap-2 text-red-400 hover:bg-white/10 focus:bg-white/5 focus:text-red-400">
                    <AlertTriangle size={16} />
                    <span>Report</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-2 hover:bg-white/10 focus:bg-white/5 focus:text-white">
                    <Copy size={16} />
                    <span>Copy ID</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-2 hover:bg-white/10 focus:bg-white/5 focus:text-white">
                    <Share2 size={16} />
                    <span>Share Token</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-2 text-yellow-400 hover:bg-white/10 focus:bg-white/5 focus:text-yellow-400">
                    <Flag size={16} />
                    <span>Flag</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* DISCOVER Variant */}
          {variant === "discover" && (
            <div className="flex w-full items-center justify-between sm:justify-end sm:gap-4">
              {/* Left side: Stats info */}
              <div className="flex shrink-0 items-center gap-2 font-utsaha text-sm whitespace-nowrap text-gray-400">
                <div className="flex items-center gap-1">
                  <Badge rank={rank} size={18} />
                  <span className="font-medium text-white">{attestations}</span>
                </div>
                <span className="hidden xs:inline">Attestations</span>
              </div>

              {/* Right side: Buttons group */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={onViewAll}
                  className="px-1 font-utsaha text-xs font-bold text-brand-blue transition-colors hover:text-blue-400 sm:px-2 sm:text-sm"
                >
                  View
                </button>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={onRevoke}
                    className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1.5 font-utsaha text-xs text-red-500 transition-colors hover:bg-red-500/20 sm:px-3 sm:text-sm"
                  >
                    Revoke
                  </button>
                  <button
                    onClick={onAttest}
                    className="rounded-lg bg-brand-blue px-2 py-1.5 font-utsaha text-xs text-white transition-all hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98] sm:px-3 sm:text-sm"
                  >
                    Attest
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors outline-none hover:bg-white/5 hover:text-white">
                        <MoreVertical size={18} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 border-card-inner-bg bg-app-bg font-utsaha text-white"
                    >
                      <DropdownMenuItem className="cursor-pointer gap-2 hover:bg-white/10 focus:bg-white/5 focus:text-white">
                        <Share2 size={16} />
                        <span>Share Token</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer gap-2 hover:bg-white/10 focus:bg-white/5 focus:text-white">
                        <Copy size={16} />
                        <span>Copy ID</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer gap-2 hover:bg-white/10 focus:bg-white/5 focus:text-white"
                        onClick={() => setIsTokenFormOpen(true)}
                      >
                        <Edit size={16} />
                        <span>Edit Token</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer gap-2 text-red-400 hover:bg-white/10 focus:bg-white/5 focus:text-red-400">
                        <Flame size={16} />
                        <span>Burn Token</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <TokenForm
        isOpen={isTokenFormOpen}
        onClose={() => setIsTokenFormOpen(false)}
        tokenName={name}
        tokenId={BigInt(tokenId.replace(/^#/, ""))}
      />
    </>
  );
}
