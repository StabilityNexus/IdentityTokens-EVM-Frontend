"use client";

import { useEffect, useMemo, useState } from "react";
import IDCard from "../cards/IDCard";
import { ShareModal } from "@/components/share/ShareModal";
import { buildIdentityShare, getWalletUrl } from "@/lib/share";
import { IDMetricsProps } from "@/lib/types";
import { IoCopyOutline, IoShareSocialOutline } from "react-icons/io5";

const IDMetrics: React.FC<IDMetricsProps> = ({
  name = "",
  walletAddress = "",
  attesters = 0,
  lastUpdated = "—",
  isOwn = false,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // "Copy ID" and "Share" both hand out the wallet's public page on the site.
  const walletUrl = getWalletUrl(walletAddress);
  const shareContent = useMemo(
    () => buildIdentityShare(walletUrl, isOwn),
    [walletUrl, isOwn]
  );

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopyID = () => {
    navigator.clipboard?.writeText(walletUrl).then(
      () => setCopied(true),
      (error: unknown) => console.error("Failed to copy:", error)
    );
  };

  // Outside the card: its backdrop blur would trap the modal's fixed overlay.
  return (
    <>
      <div
        className={`flex w-full flex-col gap-6 overflow-hidden rounded-2xl border border-card-border bg-card-bg p-6 backdrop-blur-[2.6px] lg:flex-row ${className}`}
      >
        {/* ID Card */}
        <div className="flex w-full flex-shrink-0 justify-center lg:w-[340px] lg:justify-start">
          <IDCard
            username={name}
            walletAddress={walletAddress}
            attesters={attesters}
            still
          />
        </div>

        {/* Info and Actions */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 py-2 lg:gap-2 lg:pl-4">
          {/* Info Section */}
          <div className="flex flex-col gap-4 font-utsaha lg:gap-3">
            {/* Decentralized ID */}
            <div className="flex flex-col gap-1 md:gap-2">
              <h3 className="text-xl leading-tight text-white opacity-90 md:text-2xl">
                Decentralized Id
              </h3>
              <p className="font-utsaha text-lg leading-relaxed break-all text-text-grey md:text-xl">
                {walletAddress.length > 20
                  ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`
                  : walletAddress}
              </p>
            </div>

            {/* Last Updated */}
            <div className="flex flex-col gap-1 md:gap-2">
              <h3 className="text-xl leading-tight text-white opacity-90 md:text-2xl">
                Last Updated
              </h3>
              <p className="font-utsaha text-lg leading-relaxed text-text-grey md:text-xl">
                {lastUpdated}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-1 flex flex-row flex-nowrap gap-3 lg:mt-0 lg:justify-start">
            {/* Copy ID Button */}
            <button
              onClick={handleCopyID}
              title={walletUrl}
              className="group flex items-center gap-1.5 transition-all hover:opacity-80"
            >
              <IoCopyOutline className="h-4 w-4 text-white lg:h-3.5 lg:w-3.5" />
              <span className="font-utsaha text-base whitespace-nowrap text-white md:text-lg lg:text-sm">
                {copied ? "Copied!" : "Copy ID"}
              </span>
            </button>

            {/* Share Button */}
            <button
              onClick={() => setIsShareOpen(true)}
              className="group flex items-center gap-1.5 transition-all hover:opacity-80"
            >
              <IoShareSocialOutline className="h-4 w-4 text-white lg:h-3.5 lg:w-3.5" />
              <span className="font-utsaha text-base whitespace-nowrap text-white md:text-lg lg:text-sm">
                Share
              </span>
            </button>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        content={shareContent}
        title={isOwn ? "Share your identity" : "Share this identity"}
        subtitle="Post it with a ready-written message, or copy the link."
      />
    </>
  );
};

export default IDMetrics;
