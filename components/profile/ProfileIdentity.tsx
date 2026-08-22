"use client";

import React, { useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { ProfileCard } from "./ProfileCard";
import { getEtherscanAddressUrl } from "@/lib/errors";

interface ProfileIdentityProps {
  walletAddress?: string;
  ens: string;
  profileTokenId?: bigint;
  className?: string;
}

function truncateAddress(address: string): string {
  if (address.length <= 20) return address;
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

export function ProfileIdentity({
  walletAddress,
  ens,
  profileTokenId,
  className,
}: ProfileIdentityProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the full address stays visible on hover.
    }
  };

  return (
    <ProfileCard title="On-chain identity" className={className}>
      <dl className="flex flex-col divide-y divide-profile-border">
        {walletAddress && (
          <div className="flex items-center justify-between gap-3 pb-3">
            <dt className="font-utsaha text-sm text-profile-muted">Wallet</dt>
            <dd className="flex min-w-0 items-center gap-1.5">
              <span
                title={walletAddress}
                className="truncate font-utsaha text-sm text-white"
              >
                {truncateAddress(walletAddress)}
              </span>
              <button
                type="button"
                onClick={copyAddress}
                aria-label="Copy wallet address"
                className="shrink-0 rounded-md p-1.5 text-profile-muted transition-colors hover:bg-white/5 hover:text-white"
              >
                {copied ? (
                  <Check size={13} className="text-brand-green" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
              <a
                href={getEtherscanAddressUrl(walletAddress)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View wallet on Etherscan"
                className="shrink-0 rounded-md p-1.5 text-profile-muted transition-colors hover:bg-white/5 hover:text-white"
              >
                <ArrowUpRight size={13} />
              </a>
            </dd>
          </div>
        )}

        {ens && (
          <div className="flex items-center justify-between gap-3 py-3">
            <dt className="font-utsaha text-sm text-profile-muted">ENS</dt>
            <dd className="truncate font-utsaha text-sm text-white">{ens}</dd>
          </div>
        )}

        {profileTokenId !== undefined && (
          <div className="flex items-center justify-between gap-3 pt-3">
            <dt className="font-utsaha text-sm text-profile-muted">
              Profile token
            </dt>
            <dd className="font-utsaha text-sm text-white">
              #{profileTokenId.toString()}
            </dd>
          </div>
        )}
      </dl>
    </ProfileCard>
  );
}

export default ProfileIdentity;