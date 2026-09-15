import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import { FeatureSection } from "@/components/FeatureSection";
import CTASection from "@/components/CTASection";
import { ConnectPromptProvider } from "@/contexts/ConnectPromptContext";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-landing-bg dark:bg-landing-bg-dark">
      <ConnectPromptProvider>
        <Navbar />
        <Hero />
      </ConnectPromptProvider>
      <HowItWorks />
      <FeatureSection />
      <CTASection />
    </main>
  );
}
