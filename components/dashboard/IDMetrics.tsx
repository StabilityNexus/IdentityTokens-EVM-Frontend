"use client";

import { useState } from "react";
import IDCard from "../cards/IDCard";
import { IDCardProps, IDMetricsProps } from "@/lib/types";
import { IoCopyOutline, IoShareSocialOutline } from "react-icons/io5";

const IDMetrics: React.FC<IDMetricsProps> = ({
  name = "Default Name",
  nationality = "Indian",
  walletAddress = "0x9032345320958093280943r82",
  attesters = 128,
  lastUpdated = "1 Day Ago",
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyID = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        alert("Clipboard API not available. Please manually copy the ID.");
      }
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy ID.");
    }
  };

  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name}'s Decentralized ID`,
          text: `Check out ${name}'s DIT profile`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(window.location.href);
          alert("Profile link copied to clipboard!");
        } else {
          alert(
            `Share and Clipboard APIs unavailable. URL: ${window.location.href}`
          );
        }
      } catch (err) {
        console.error("Failed to copy fallback URL:", err);
        alert(`Failed to copy link. Profile URL: ${window.location.href}`);
      }
    }
  };

  return (
    <div
      className={`flex w-full flex-col gap-6 overflow-hidden rounded-2xl border border-card-border bg-card-bg p-6 backdrop-blur-[2.6px] lg:flex-row ${className}`}
    >
      {/* ID Card */}
      <div className="flex flex-shrink-0 justify-center lg:w-[340px] lg:justify-start">
        <IDCard
          name={name}
          nationality={nationality}
          walletAddress={walletAddress}
          attesters={attesters}
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
            className="group flex items-center gap-1.5 transition-all hover:opacity-80"
          >
            <IoCopyOutline className="h-4 w-4 text-white lg:h-3.5 lg:w-3.5" />
            <span className="font-utsaha text-base whitespace-nowrap text-white md:text-lg lg:text-sm">
              {copied ? "Copied!" : "Copy ID"}
            </span>
          </button>

          {/* Share Profile Button */}
          <button
            onClick={handleShareProfile}
            className="group flex items-center gap-1.5 transition-all hover:opacity-80"
          >
            <IoShareSocialOutline className="h-4 w-4 text-white lg:h-3.5 lg:w-3.5" />
            <span className="font-utsaha text-base whitespace-nowrap text-white md:text-lg lg:text-sm">
              Share Profile
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IDMetrics;
