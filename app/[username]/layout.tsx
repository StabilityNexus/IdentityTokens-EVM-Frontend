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
        <main className="no-scrollbar flex-1 overflow-y-auto bg-app-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
