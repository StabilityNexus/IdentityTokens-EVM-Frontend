"use client";

import IDMetrics from "./IDMetrics";
import Metrics from "./Metrics";
import { WhoAttested } from "@/components/attestations/WhoAttested";
import { countActiveAttesters } from "@/lib/helpers";
import { DashboardMetricsProps } from "@/lib/types";

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  name,
  walletAddress,
  rootId,
  lastUpdated,
  isOwn,
  whoAttested,
  totalAttestations,
  activeTokens,
  socials,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col gap-6 px-4 pt-9 sm:px-6 md:pr-14 md:pl-10 ${className}`}
    >
      {/* Row 1: IDMetrics + Who attested side by side */}
      <div className="flex flex-col gap-[29px] lg:flex-row">
        {/* IDMetrics takes ~60% */}
        <div className="w-full min-w-0 lg:flex-[1.6]">
          <IDMetrics
            name={name}
            walletAddress={walletAddress}
            rootId={rootId}
            attesters={countActiveAttesters(whoAttested.attesters)}
            lastUpdated={lastUpdated}
            isOwn={isOwn}
          />
        </div>

        {/* Who attested takes ~40% */}
        <div className="w-full min-w-0 lg:flex-1">
          <WhoAttested variant="dashboard" {...whoAttested} />
        </div>
      </div>

      {/* Row 2: Metrics (full width) */}
      <Metrics
        totalAttestations={totalAttestations}
        activeTokens={activeTokens}
        socials={socials}
      />
    </div>
  );
};

export default DashboardMetrics;
