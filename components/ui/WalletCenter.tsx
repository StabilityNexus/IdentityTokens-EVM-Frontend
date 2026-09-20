"use client";

import React, { useState } from "react";
import { Wallet, Copy, Check, ExternalLink, LogOut, Globe } from "lucide-react";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { getEtherscanAddressUrl } from "@/lib/errors";
import { TOUR_TARGETS } from "@/lib/tour";
import { truncateAddress } from "@/lib/helpers";

const TRIGGER_CLASSES =
  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/60 transition-all duration-200 hover:bg-white/5 hover:text-white focus:outline-none sm:h-10 sm:w-10";

const ITEM_CLASSES =
  "cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-200 transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white";

export function WalletCenter() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);

  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { disconnect, disconnectAsync } = useDisconnect();

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fully await the disconnect so wagmi and RainbowKit state clears before the
  // connect modal reopens.
  const handleSwitchWallet = async () => {
    try {
      await disconnectAsync();
    } catch {
      disconnect();
    }

    setTimeout(() => {
      openConnectModal?.();
    }, 150);
  };

  if (!isConnected) {
    return (
      <button
        type="button"
        onClick={() => openConnectModal?.()}
        className={TRIGGER_CLASSES}
        data-tour={TOUR_TARGETS.walletCenter}
        aria-label="Connect wallet"
        title="Connect wallet"
      >
        <Wallet size={18} className="sm:hidden" />
        <Wallet size={20} className="hidden sm:block" />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={TRIGGER_CLASSES}
          data-tour={TOUR_TARGETS.walletCenter}
          aria-label="Manage wallet"
          title="Manage wallet"
        >
          <Wallet size={18} className="sm:hidden" />
          <Wallet size={20} className="hidden sm:block" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-green ring-2 ring-dashboard-bg sm:top-2 sm:right-2" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 border border-white/10 bg-[#18191d] p-2 font-utsaha shadow-2xl backdrop-blur-md"
      >
        <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-gray-400">Connected Wallet</p>
            <p className="truncate font-mono text-xs font-semibold text-white">
              {address ? truncateAddress(address, 6, 4) : "Connected"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyAddress}
            className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            title={copied ? "Copied!" : "Copy address"}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-brand-green" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        <DropdownMenuSeparator className="my-1.5 bg-white/10" />

        <DropdownMenuItem onClick={handleSwitchWallet} className={ITEM_CLASSES}>
          <Wallet className="h-4 w-4 text-gray-400" />
          <span>Switch Wallet</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => openChainModal?.()}
          className={ITEM_CLASSES}
        >
          <Globe className="h-4 w-4 text-gray-400" />
          <span>Switch Network</span>
        </DropdownMenuItem>

        {address && (
          <DropdownMenuItem
            onClick={() =>
              window.open(getEtherscanAddressUrl(address), "_blank")
            }
            className={ITEM_CLASSES}
          >
            <ExternalLink className="h-4 w-4 text-gray-400" />
            <span>View on Explorer</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="my-1.5 bg-white/10" />

        <DropdownMenuItem
          onClick={() => disconnect()}
          className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300"
        >
          <LogOut className="h-4 w-4 text-red-400" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default WalletCenter;
