import type { Metadata } from "next";

const TITLE = "Claim your username | DIT";
const DESCRIPTION =
  "Reserve your DIT username and claim your ID card: a portable, recoverable, self-sovereign identity that lives on-chain.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://dit.stability.nexus/claim",
    siteName: "Stability Nexus DIT",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ClaimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
