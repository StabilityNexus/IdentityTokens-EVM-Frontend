"use client";

import React from "react";
import { useParams } from "next/navigation";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import { UserTokenList } from "@/components/dashboard/UserTokenList";
import { TokenData } from "@/components/dashboard/TokenList";

const mockUserTokens: TokenData[] = [
  {
    tokenId: "0xa1b2c3",
    name: "Vaccine Certificate",
    type: "Health",
    expiresIn: "3 years",
    endorsements: 87,
  },
  {
    tokenId: "0xd4e5f6",
    name: "University Degree",
    type: "Education",
    expiresIn: "Never",
    endorsements: 142,
  },
  {
    tokenId: "0xg7h8i9",
    name: "KYC Verified",
    type: "Identity",
    expiresIn: "2 years",
    endorsements: 56,
  },
  {
    tokenId: "0xj0k1l2",
    name: "Employment Record",
    type: "Work",
    expiresIn: "1 year",
    endorsements: 24,
  },
  {
    tokenId: "0xm3n4o5",
    name: "Open Source Contributor",
    type: "Skill",
    expiresIn: "Never",
    endorsements: 203,
  },
];

export default function UsernamePage() {
  const params = useParams<{ username: string }>();
  const username = params?.username ?? "";

  return (
    <div className="flex h-full flex-col gap-8 bg-app-bg pb-12">
      <DashboardMetrics
        name={username}
        age={20}
        nationality="Indian"
        walletAddress="0x9032345320958093280943r82"
        endorsers={128}
        lastUpdated="1 Day Ago"
        trustScore={92}
        trustFlags="None"
        trustDescription="Their On-Chain Reputation is excellent"
        totalEndorsements={70}
        activeTokens={14}
        socials={3}
        badgesEarned="300+ Trust Received"
      />

      <div className="px-4 sm:px-6 md:pr-14 md:pl-10">
        <UserTokenList
          tokens={mockUserTokens}
          onEndorse={(id) => console.log("Endorsing token:", id)}
          onRevoke={(id) => console.log("Revoking token:", id)}
        />
      </div>
    </div>
  );
}
