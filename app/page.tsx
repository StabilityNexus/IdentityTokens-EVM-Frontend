import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import { FeatureSection } from "@/components/FeatureSection";
import CTASection from "@/components/CTASection";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { absoluteUrl, pageMetadata, SITE_NAME } from "@/lib/seo";

const description =
  "Create a decentralized identity you own. Mint a root identity, reserve a username, add a profile token, and receive attestations from other wallets. Open source by Stability Nexus.";

export const metadata: Metadata = pageMetadata({
  title: `${SITE_NAME} (DIT) — an on-chain identity you own`,
  description,
  path: "/",
  absoluteTitle: true,
});

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${absoluteUrl("/")}#website`,
      url: absoluteUrl("/"),
      name: SITE_NAME,
      alternateName: "DIT",
      description,
      inLanguage: "en",
      publisher: { "@id": `${absoluteUrl("/")}#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${absoluteUrl("/")}#organization`,
      name: "Stability Nexus",
      url: "https://stability.nexus",
      sameAs: [
        "https://github.com/StabilityNexus",
        "https://github.com/StabilityNexus/IdentityTokens-EVM-Frontend",
      ],
    },
    {
      "@type": "WebApplication",
      "@id": `${absoluteUrl("/")}#app`,
      name: SITE_NAME,
      url: absoluteUrl("/"),
      description,
      applicationCategory: "SecurityApplication",
      operatingSystem: "Any (web browser)",
      browserRequirements:
        "Requires JavaScript and an EVM-compatible wallet to sign transactions",
      provider: { "@id": `${absoluteUrl("/")}#organization` },
    },
  ],
};

export default function Home() {
  return (
    <>
      <SeoJsonLd data={structuredData} />
      <main className="relative min-h-screen w-full bg-landing-bg dark:bg-landing-bg-dark">
        <Navbar />
        <Hero />
        <HowItWorks />
        <FeatureSection />
        <CTASection />
      </main>
    </>
  );
}
