import type { Metadata } from "next";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

import {
  atypFont,
  garamondFont,
  utsahaFont,
  comfortaaFont,
} from "../lib/fonts";
import { Providers } from "@/providers/providers";
import { absoluteUrl, OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Decentralized Identity Token (DIT) — an on-chain identity you own",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Create a decentralized identity you own. Connect a wallet to mint a root identity, reserve a username, add a profile token, and collect attestations from other wallets. Open-source web app by Stability Nexus.",
  applicationName: SITE_NAME,
  keywords: [
    "Decentralized Identity",
    "Self-Sovereign Identity",
    "Web3",
    "Ethereum",
    "Identity Token",
    "Stability Nexus",
  ],
  authors: [{ name: "Stability Nexus", url: "https://stability.nexus" }],
  creator: "Stability Nexus",
  publisher: "Stability Nexus",
  icons: {
    icon: absoluteUrl("/assets/logo.svg"),
  },
  openGraph: {
    title: `${SITE_NAME} (DIT)`,
    description:
      "Create an on-chain identity you own: a root identity, a username, a profile token, and attestations from other wallets.",
    siteName: "Stability Nexus DIT",
    locale: "en_US",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} (DIT)`,
    description:
      "Create an on-chain identity you own: a root identity, a username, a profile token, and attestations from other wallets.",
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${atypFont.variable} ${garamondFont.variable} ${utsahaFont.variable} ${comfortaaFont.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
