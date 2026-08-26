"use client";

import Badge from "./Badge";
import { MetricsProps } from "@/lib/types";

const Metrics: React.FC<MetricsProps> = ({
  totalEndorsements = 70,
  activeTokens = 14,
  socials = 3,
  badgeRank = "diamond",
  badgeDescription = "300+ Trust Recieved",
  className = "",
}) => {
  return (
    <div
      className={`flex w-full flex-col items-start gap-6 rounded-2xl border border-card-border bg-card-bg p-6 backdrop-blur-[2.6px] md:flex-row md:flex-wrap md:items-center md:gap-6 ${className}`}
    >
      {/* Total Endorsements */}
      <div className="flex min-w-[120px] flex-col gap-2 font-utsaha">
        <h3 className="text-2xl leading-tight text-white">
          Total Endorsements
        </h3>
        <p className="text-xl leading-relaxed text-text-grey">
          {totalEndorsements}
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

      {/* Badges Earned */}
      <div className="flex min-w-[200px] flex-col gap-3 font-utsaha">
        <h3 className="text-2xl leading-tight text-white">Badges Earned</h3>
        <div className="flex items-center gap-2">
          <Badge rank={badgeRank} size={30} />
          <p className="text-xl leading-relaxed text-text-grey">
            {badgeDescription}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Metrics;
