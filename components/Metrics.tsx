"use client";

import { MetricsProps } from "@/lib/types";

const Metrics: React.FC<MetricsProps> = ({
  totalAttestations = 70,
  activeTokens = 14,
  socials = 3,
  className = "",
}) => {
  return (
    <div
      className={`flex w-full flex-col items-start gap-6 rounded-2xl border border-card-border bg-card-bg p-6 backdrop-blur-[2.6px] md:flex-row md:flex-wrap md:items-center md:gap-6 ${className}`}
    >
      {/* Total Attestations */}
      <div className="flex min-w-[120px] flex-col gap-2 font-utsaha">
        <h3 className="text-2xl leading-tight text-white">
          Total Attestations
        </h3>
        <p className="text-xl leading-relaxed text-text-grey">
          {totalAttestations}
        </p>
      </div>

      {/* Active Tokens */}
      <div className="flex min-w-[100px] flex-col gap-2 font-utsaha">
        <h3 className="text-2xl leading-tight text-white">Active Tokens</h3>
        <p className="text-xl leading-relaxed text-text-grey">{activeTokens}</p>
      </div>

      {/* Socials */}
      <div className="flex min-w-[80px] flex-col gap-2 font-utsaha">
        <h3 className="text-2xl leading-tight text-white">Socials</h3>
        <p className="text-xl leading-relaxed text-text-grey">{socials}</p>
      </div>
    </div>
  );
};

export default Metrics;
