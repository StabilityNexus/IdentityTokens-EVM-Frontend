"use client";

import React, { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/Button";
import { FiBell, FiPlus } from "react-icons/fi";
import { WalletCenter } from "../ui/WalletCenter";
import { CreateTokenModal } from "../forms/CreateTokenModal";
import { CreateProfileModal } from "../forms/CreateProfileModal";
import { SearchBar } from "../dashboard/SearchBar";
import { useIdentityGate } from "@/hooks/useIdentityGate";

export function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams?.get("q") ?? "";

  const [isCreateTokenModalOpen, setIsCreateTokenModalOpen] = useState(false);
  const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] =
    useState(false);

  const {
    isConnected,
    hasProfile,
    profileData,
    refetchHasProfile,
    refetchWalletTokens,
  } = useIdentityGate();

  const knownRoutes = [
    "/",
    "/home",
    "/dashboard",
    "/discover",
    "/settings",
    "/wallet",
  ];
  const firstSegment = pathname?.split("/").filter(Boolean)[0] ?? "";
  const isUserProfile =
    pathname !== "/" &&
    !knownRoutes.includes(pathname) &&
    firstSegment.length > 0;

  const isDiscover = pathname === "/discover";
  const isDashboard = pathname === "/dashboard";

  const profileUsername = profileData?.username;
  const canVisitProfile = !!hasProfile && !!profileUsername;
  const isAwaitingProfile = !!hasProfile && !profileUsername;

  const getPageTitle = () => {
    if (!pathname || pathname === "/") return "Home";
    const segments = pathname.split("/").filter(Boolean);
    const route = segments[segments.length - 1] || "Home";
    return route.charAt(0).toUpperCase() + route.slice(1);
  };

  const handleButtonClick = () => {
    if (!isConnected) return;

    if (isDashboard) {
      if (canVisitProfile && profileUsername) {
        // Visit the user's profile in a new tab
        window.open(`/profile?u=${profileUsername}`, "_blank");
      } else if (!hasProfile) {
        setIsCreateProfileModalOpen(true);
      }
    } else {
      // Home, Discover, etc: New Token
      setIsCreateTokenModalOpen(true);
    }
  };

  const getButtonLabel = () => {
    if (isDashboard) {
      if (hasProfile) return "Visit Profile";
      return "Create Profile";
    }
    if (isDiscover) return null; // icon only
    return "New Token";
  };

  const handleSearchChange = (val: string) => {
    if (!val) {
      router.push("/discover");
    } else {
      router.push(`/discover?q=${encodeURIComponent(val)}`);
    }
  };

  const [profileQuery, setProfileQuery] = React.useState("");

  const submitProfileSearch = () => {
    const query = profileQuery.trim();
    if (query) router.push(`/discover?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <nav className="flex h-[72px] w-full shrink-0 items-center justify-between border-b border-white/5 bg-dashboard-bg pr-4 pl-14 sm:pr-5 sm:pl-16 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          {!isUserProfile && (
            <h1 className="max-w-[120px] shrink-0 truncate font-utsaha text-lg tracking-wide text-white sm:max-w-none sm:text-xl">
              {getPageTitle()}
            </h1>
          )}

          {isDiscover && (
            <SearchBar
              placeholder="Search by Token ID or Decentralized ID…"
              value={currentQuery}
              onChange={handleSearchChange}
            />
          )}

          {isUserProfile && (
            <SearchBar
              placeholder="Search profiles and tokens…"
              value={profileQuery}
              onChange={setProfileQuery}
              onSubmit={submitProfileSearch}
            />
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
          {/* Notification bell */}
          <button
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/60 transition-all duration-200 hover:bg-white/5 hover:text-white sm:h-10 sm:w-10"
            aria-label="Notifications"
          >
            <FiBell size={18} className="sm:hidden" />
            <FiBell size={22} className="hidden sm:block" />
          </button>

          {/* Create Profile / New Token / icon-only on /discover */}
          {!isUserProfile && (
            <Button
              className={`flex items-center justify-center rounded-full border-none font-utsaha shadow-none transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                isDashboard && hasProfile
                  ? "bg-landing-bg text-dashboard-bg hover:bg-landing-bg/90"
                  : "bg-brand-green text-dashboard-bg hover:bg-brand-green/90"
              } ${
                isDiscover
                  ? "h-9 w-9 p-0 sm:h-10 sm:w-10"
                  : "gap-1.5 px-3 py-1.5 text-sm sm:gap-2.5 sm:px-4 sm:py-2.5 sm:text-base md:px-5 md:text-xl"
              } ${!isConnected || isAwaitingProfile ? "cursor-not-allowed opacity-50" : ""}`}
              aria-label={
                isDiscover
                  ? "New Token"
                  : isDashboard
                    ? hasProfile
                      ? "Visit Profile"
                      : "Create Profile"
                    : undefined
              }
              onClick={handleButtonClick}
              disabled={!isConnected || isAwaitingProfile}
            >
              {!(isDashboard && hasProfile) && (
                <FiPlus
                  size={18}
                  className="shrink-0 sm:hidden"
                  strokeWidth={3}
                />
              )}
              {!(isDashboard && hasProfile) && (
                <FiPlus
                  size={20}
                  className="hidden shrink-0 sm:block"
                  strokeWidth={3}
                />
              )}
              {!isDiscover && <span>{getButtonLabel()}</span>}
            </Button>
          )}

          <WalletCenter />
        </div>
      </nav>

      {/* Create Token Modal */}
      <CreateTokenModal
        isOpen={isCreateTokenModalOpen}
        onClose={() => setIsCreateTokenModalOpen(false)}
        onSuccess={() => {
          refetchWalletTokens();
          setIsCreateTokenModalOpen(false);
        }}
      />

      {/* Create Profile Modal */}
      <CreateProfileModal
        isOpen={isCreateProfileModalOpen}
        onClose={() => setIsCreateProfileModalOpen(false)}
        onSuccess={() => {
          refetchHasProfile();
          setIsCreateProfileModalOpen(false);
        }}
      />
    </>
  );
}
