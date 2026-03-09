import {
  Navbar,
  Hero,
  HowItWorks,
  FeatureSection,
  CTASection,
} from "@/components";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-landing-bg dark:bg-landing-bg-dark">
      <Navbar />
      <Hero />
      <HowItWorks />
      <FeatureSection />
      <CTASection />
    </main>
  );
}
