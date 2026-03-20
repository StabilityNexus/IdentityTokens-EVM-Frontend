import type { Metadata } from "next";
import "./globals.css";

import {
  atypFont,
  garamondFont,
  utsahaFont,
  comfortaaFont,
} from "../lib/fonts";
import { Providers } from "@/providers/providers";

export const metadata: Metadata = {
  title: "Decentralized Identity Token",
  description: "Portable, Recoverable and Self-Sovereign Identity",
  icons: {
    icon: "/assets/logo.svg",
  },
  keywords: [
    "Decentralized Identity",
    "Self-Sovereign Identity",
    "Web3",
    "Ethereum",
    "Identity Token",
    "Stability Nexus",
  ],
  openGraph: {
    title: "Decentralized Identity Token",
    description: "Portable, Recoverable and Self-Sovereign Identity",
    url: "https://dit.stability.nexus/",
    siteName: "Stability Nexus DIT",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: "Decentralized Identity Token",
    description: "Portable, Recoverable and Self-Sovereign Identity",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${atypFont.variable} ${garamondFont.variable} ${utsahaFont.variable} ${comfortaaFont.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
