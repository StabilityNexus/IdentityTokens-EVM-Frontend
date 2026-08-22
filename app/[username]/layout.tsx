import React from "react";
import { DashboardSidebar } from "@/components/layout/SideBar";
import { DashboardNavbar } from "@/components/layout/DashboardNavBar";

export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-dashboard-bg">
      {/* Sidebar */}
      <div className="no-scrollbar h-full">
        <DashboardSidebar />
      </div>

      {/* Main content area (navbar + page) */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top navbar */}
        <DashboardNavbar />

        {/* Page content */}
        <main className="no-scrollbar relative flex-1 overflow-y-auto bg-app-bg">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(80%_100%_at_50%_0%,rgba(167,139,250,0.10)_0%,transparent_70%)]"
          />
          <div className="relative">{children}</div>
        </main>
      </div>
    </div>
  );
}