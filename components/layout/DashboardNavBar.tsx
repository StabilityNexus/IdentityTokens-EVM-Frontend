"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Button } from "../ui/Button";
import { FiBell, FiPlus } from "react-icons/fi";
import { CreateTokenModal, tokenSchema } from "../forms/CreateTokenModal";
import { SearchBar } from "../dashboard/SearchBar";
import { z } from "zod";

type TokenState = z.infer<typeof tokenSchema>;

export function DashboardNavbar() {
  const pathname = usePathname();
  const [isModalOpen, setIsCreateModalOpen] = React.useState(false);

  const handleCreateToken = async (data: TokenState) => {
    console.log("Creating token:", data);
    // API/logic here
    setIsCreateModalOpen(false);
  };

  const knownRoutes = ["/", "/home", "/dashboard", "/discover", "/settings"];
  const firstSegment = pathname?.split("/").filter(Boolean)[0] ?? "";
  const isUserProfile =
    pathname !== "/" &&
    !knownRoutes.includes(pathname) &&
    firstSegment.length > 0;

  const isDiscover = pathname === "/discover";

  const getPageTitle = () => {
    if (!pathname || pathname === "/") return "Home";
    const segments = pathname.split("/").filter(Boolean);
    const route = segments[segments.length - 1] || "Home";
    return route.charAt(0).toUpperCase() + route.slice(1);
  };

  return (
    <>
      <nav className="flex h-[72px] w-full shrink-0 items-center justify-between border-b border-white/5 bg-dashboard-bg pr-5 pl-16 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {!isUserProfile && (
            <h1 className="shrink-0 font-utsaha text-xl tracking-wide text-white">
              {getPageTitle()}
            </h1>
          )}

          {isDiscover && (
            <SearchBar placeholder="Search by Token ID or Decentralized ID…" />
          )}
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          {/* Notification bell */}
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white/60 transition-all duration-200 hover:bg-white/5 hover:text-white"
            aria-label="Notifications"
          >
            <FiBell size={22} />
          </button>

          {/* ── Create Identity / icon-only on /discover ── */}
          <Button
            className={`flex items-center justify-center rounded-full border-none bg-brand-green font-utsaha text-dashboard-bg shadow-none transition-transform duration-200 ease-out hover:scale-[1.02] hover:bg-brand-green/90 active:scale-[0.98] ${
              isDiscover
                ? "h-10 w-10 p-0"
                : "gap-2.5 px-4 py-2.5 text-base md:px-5 md:text-xl"
            }`}
            aria-label={isDiscover ? "Create Identity" : undefined}
            onClick={() => {
              if (pathname === "/home") setIsCreateModalOpen(true);
            }}
          >
            <FiPlus size={20} className="shrink-0" strokeWidth={3} />
            {!isDiscover && (
              <span>
                {pathname === "/home" ? "New Token" : "Create Identity"}
              </span>
            )}
          </Button>
        </div>
      </nav>

      <CreateTokenModal
        isOpen={isModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateToken={handleCreateToken}
      />
    </>
  );
}
