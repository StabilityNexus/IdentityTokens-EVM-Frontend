"use client";

import Badge from "../Badge";
import { RANK_LABELS } from "@/lib/rank";
import { MetricItemProps, MetricsProps } from "@/lib/types";

const MetricItem: React.FC<MetricItemProps> = ({
  label,
  value,
  badgeContent,
}) => (
  <div className="flex min-w-0 flex-col gap-2">
    <h4 className="font-utsaha text-lg leading-tight whitespace-nowrap text-white md:text-xl">
      {label}
    </h4>
    {badgeContent ? (
      badgeContent
    ) : (
      <p className="font-utsaha text-2xl leading-tight text-text-grey md:text-3xl">
        {value}
      </p>
    )}
  </div>
);

const Metrics: React.FC<MetricsProps> = ({
  totalAttestations = 0,
  activeTokens = 0,
  socials = 0,
  badgeRank = "bronze",
  className = "",
}) => {
  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border border-card-border bg-card-bg px-6 py-6 md:px-10 md:py-8 ${className}`}
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:gap-x-10 lg:grid-cols-4">
        <MetricItem label="Total Attestations" value={totalAttestations} />
        <MetricItem label="Active Tokens" value={activeTokens} />
        <MetricItem label="Socials" value={socials} />
        <MetricItem
          label="Badges Earned"
          badgeContent={
            <div className="flex items-center gap-2.5">
              <Badge rank={badgeRank} size={28} />
              <span className="font-utsaha text-sm text-text-grey md:text-base">
                {RANK_LABELS[badgeRank]}
              </span>
            </div>
          }
          value=""
        />
      </div>
    </div>
  );
};

export default Metrics;
