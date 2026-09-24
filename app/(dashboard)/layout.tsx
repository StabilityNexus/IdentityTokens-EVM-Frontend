import React, { Suspense } from "react";
import { DashboardSidebar } from "@/components/layout/SideBar";
import { DashboardNavbar } from "@/components/layout/DashboardNavBar";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { ProductTour } from "@/components/onboarding/ProductTour";
import { TourButton } from "@/components/onboarding/TourButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-dashboard-bg">
      {/* A wallet with no root identity belongs in /onboarding first. */}
      <OnboardingGate />

      {/* In the layout so one driver.js instance survives /dashboard → /home. */}
      <Suspense fallback={null}>
        <ProductTour />
      </Suspense>

      {/* Sidebar */}
      <div className="no-scrollbar h-full">
        <DashboardSidebar />
      </div>

      {/* Main content area (navbar + page) */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top navbar. Wrapped because it reads search params, which Next
            expects to sit under a Suspense boundary in a prerendered route.
            The fallback mirrors the navbar's own height and border so the
            layout does not shift. */}
        <Suspense
          fallback={
            <div className="h-[72px] w-full shrink-0 border-b border-white/5 bg-dashboard-bg" />
          }
        >
          <DashboardNavbar />
        </Suspense>

        {/* Page content */}
        <main className="no-scrollbar flex-1 overflow-y-auto bg-app-bg">
          <Suspense fallback={null}>{children}</Suspense>
        </main>

        {/* Replays the tour on demand for anyone who closed it. */}
        <TourButton />
      </div>
    </div>
  );
}
