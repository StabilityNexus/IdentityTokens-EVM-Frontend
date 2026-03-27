"use client";

import React from "react";
import { TokenList } from "@/components/dashboard/TokenList";

const discoverTokens = [
  {
    tokenId: "0xabc123",
    name: "Early Adopter",
    type: "Achievement",
    expiresIn: "Never",
    endorsements: 156,
  },
  {
    tokenId: "0xdef456",
    name: "Verified Human",
    type: "Identity",
    expiresIn: "1 year",
    endorsements: 89,
  },
  {
    tokenId: "0xghi789",
    name: "Alpha Tester",
    type: "Access",
    expiresIn: "6 months",
    endorsements: 34,
  },
  {
    tokenId: "0xjkl012",
    name: "Governance Delegate",
    type: "Role",
    expiresIn: "2 years",
    endorsements: 210,
  },
  {
    tokenId: "0xmno345",
    name: "Bug Bounty Hunter",
    type: "Skill",
    expiresIn: "Never",
    endorsements: 12,
  },
];

export default function DiscoverPage() {
  return (
    <main className="flex flex-col gap-6 px-4 pt-9 pb-12 sm:px-6 md:pr-14 md:pl-10">
      <TokenList
        variant="discover"
        tokens={discoverTokens}
        onEndorse={() => {}}
        onRevoke={() => {}}
      />
    </main>
  );
}
