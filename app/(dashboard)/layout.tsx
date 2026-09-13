"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { DashboardSidebar } from "@/components/layout/SideBar";
import { DashboardNavbar } from "@/components/layout/DashboardNavBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isConnected, status } = useAccount();

  // wagmi restores a persisted session asynchronously, so isConnected is
  // briefly false on load even for an already-connected wallet. Wait until
  // that resolves before deciding to send the user back to the landing page.
  const isResolvingConnection =
    status === "connecting" || status === "reconnecting";

  useEffect(() => {
    if (!isResolvingConnection && !isConnected) {
      router.replace("/");
    }
  }, [isResolvingConnection, isConnected, router]);

  if (isResolvingConnection || !isConnected) {
    return <div className="h-screen bg-dashboard-bg" />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-dashboard-bg">
      {/* Sidebar */}
      <div className="no-scrollbar h-full">
        <DashboardSidebar />
      </div>

      {/* Main content area (navbar + page) */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
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
      </div>
    </div>
  );
}
