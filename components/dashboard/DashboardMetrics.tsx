"use client";

import IDMetrics, { IDMetricsProps } from "./IDMetrics";
import TrustScore from "./TrustScore";
import Metrics, { MetricsProps } from "./Metrics";

export interface DashboardMetricsProps extends IDMetricsProps, MetricsProps {
  // TrustScore props (renamed to distinguish from other metrics if needed)
  trustScore?: number;
  trustFlags?: string;
  trustDescription?: string;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  name,
  age,
  nationality,
  walletAddress,
  endorsers,
  lastUpdated,
  trustScore,
  trustFlags,
  trustDescription,
  totalEndorsements,
  activeTokens,
  socials,
  badgesEarned,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col gap-6 px-4 pt-9 sm:px-6 md:pr-14 md:pl-10 ${className}`}
    >
      {/* Row 1: IDMetrics + TrustScore side by side */}
      <div className="flex flex-col gap-[29px] lg:flex-row">
        {/* IDMetrics takes ~60% */}
        <div className="w-full min-w-0 lg:flex-[1.6]">
          <IDMetrics
            name={name}
            age={age}
            nationality={nationality}
            walletAddress={walletAddress}
            endorsers={endorsers}
            lastUpdated={lastUpdated}
          />
        </div>

        {/* TrustScore takes ~40% */}
        <div className="w-full min-w-0 lg:flex-1">
          <TrustScore
            score={trustScore}
            flags={trustFlags}
            description={trustDescription}
          />
        </div>
      </div>

      {/* Row 2: Metrics (full width) */}
      <Metrics
        totalEndorsements={totalEndorsements}
        activeTokens={activeTokens}
        socials={socials}
        badgesEarned={badgesEarned}
      />
    </div>
  );
};

export default DashboardMetrics;
