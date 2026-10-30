"use client";

import React, { useState } from "react";
import {
  Check,
  Copy,
  Flag,
  Flame,
  MoreVertical,
  Send,
  Share2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { TokenForm } from "../forms/TokenForm";
import { ShareModal } from "../share/ShareModal";
import { buildTokenShare } from "@/lib/share";
import { formatTokenId } from "@/lib/tokenId";

const ITEM =
  "cursor-pointer gap-2 hover:bg-white/10 focus:bg-white/5 focus:text-white";

interface TokenMenuProps {
  tokenId: bigint;
  name: string;
  type?: string;
  attestations?: number;
  /** Transfer and Burn; the contract rejects them from anyone but the holder */
  isOwner: boolean;
  /** Shows Flag / Report when set */
  onFlag?: () => void;
  flagDisabled?: boolean;
}

/** A token's ⋮ menu: share and copy for everyone, then the owner's or a visitor's actions. */
export function TokenMenu({
  tokenId,
  name,
  type,
  attestations,
  isOwner,
  onFlag,
  flagDisabled,
}: TokenMenuProps) {
  const [copied, setCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [form, setForm] = useState<"transfer" | "burn" | null>(null);
  const id = formatTokenId(tokenId);

  return (
    <>
      <DropdownMenu onOpenChange={(open) => !open && setCopied(false)}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="More actions"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors outline-none hover:bg-white/5 hover:text-white"
          >
            <MoreVertical size={18} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 border-card-inner-bg bg-app-bg font-utsaha text-white"
        >
          <DropdownMenuItem
            className={ITEM}
            onClick={() => setIsShareOpen(true)}
          >
            <Share2 size={16} />
            <span>Share Token</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className={ITEM}
            onSelect={(e) => {
              // Stay open so "Copied" can show
              e.preventDefault();
              navigator.clipboard?.writeText(id).then(
                () => setCopied(true),
                () => undefined
              );
            }}
          >
            {copied ? (
              <Check size={16} className="text-brand-green" />
            ) : (
              <Copy size={16} />
            )}
            <span aria-live="polite">{copied ? "Copied" : "Copy ID"}</span>
          </DropdownMenuItem>
          {isOwner && (
            <>
              <DropdownMenuItem
                className={ITEM}
                onClick={() => setForm("transfer")}
              >
                <Send size={16} />
                <span>Transfer Token</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`${ITEM} text-red-400 focus:text-red-400`}
                onClick={() => setForm("burn")}
              >
                <Flame size={16} />
                <span>Burn Token</span>
              </DropdownMenuItem>
            </>
          )}
          {onFlag && (
            <DropdownMenuItem
              disabled={flagDisabled}
              className={`${ITEM} text-yellow-400 focus:text-yellow-400`}
              onClick={onFlag}
            >
              <Flag size={16} />
              <span>Flag / Report</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        content={buildTokenShare({ id, name, type, attestations })}
        title="Share this token"
        subtitle={[name, id, type].filter(Boolean).join(" · ")}
      />

      {form && (
        <TokenForm
          isOpen
          onClose={() => setForm(null)}
          tokenName={name}
          tokenId={tokenId}
          openTransfer={form === "transfer"}
        />
      )}
    </>
  );
}
