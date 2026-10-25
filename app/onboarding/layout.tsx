import type { Metadata } from "next";

// Onboarding requires a connected wallet and has no content of its own.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
