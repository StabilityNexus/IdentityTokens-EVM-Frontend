"use client";

import { MetricItemProps, MetricsProps } from "@/lib/types";

const MetricItem: React.FC<MetricItemProps> = ({ label, value }) => (
  <div className="flex min-w-0 flex-col gap-2">
    <h4 className="font-utsaha text-lg leading-tight whitespace-nowrap text-white md:text-xl">
      {label}
    </h4>
    <p className="font-utsaha text-2xl leading-tight text-text-grey md:text-3xl">
      {value}
    </p>
  </div>
);

const Metrics: React.FC<MetricsProps> = ({
  totalAttestations = 0,
  activeTokens = 0,
  socials = 0,
  className = "",
}) => {
  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border border-card-border bg-card-bg px-6 py-6 md:px-10 md:py-8 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-6 md:gap-x-10">
        <MetricItem label="Total Attestations" value={totalAttestations} />
        <MetricItem label="Active Tokens" value={activeTokens} />
        <MetricItem label="Socials" value={socials} />
      </div>
    </div>
  );
};

export default Metrics;
