"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/Button";
import { FiBell, FiPlus } from "react-icons/fi";
import { CreateTokenModal } from "../forms/CreateTokenModal";
import { CreateProfileModal } from "../forms/CreateProfileModal";
import { SearchBar } from "../dashboard/SearchBar";
import { useIdentityGate } from "@/hooks/useIdentityGate";

export function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams?.get("q") ?? "";

  const [isCreateTokenModalOpen, setIsCreateTokenModalOpen] =
    React.useState(false);
  const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] =
    React.useState(false);

  const {
    isConnected,
    hasProfile,
    profileData,
    refetchHasProfile,
    refetchWalletTokens,
  } = useIdentityGate();

  const knownRoutes = ["/", "/home", "/dashboard", "/discover", "/settings"];
  const firstSegment = pathname?.split("/").filter(Boolean)[0] ?? "";
  const isUserProfile =
    pathname !== "/" &&
    !knownRoutes.includes(pathname) &&
    firstSegment.length > 0;

  const isDiscover = pathname === "/discover";
  const isDashboard = pathname === "/dashboard";
  const isHome = pathname === "/home";

  const getPageTitle = () => {
    if (!pathname || pathname === "/") return "Home";
    const segments = pathname.split("/").filter(Boolean);
    const route = segments[segments.length - 1] || "Home";
    return route.charAt(0).toUpperCase() + route.slice(1);
  };

  const handleButtonClick = () => {
    if (!isConnected) return;

    if (isDashboard) {
      if (hasProfile && profileData?.username) {
        // Visit the user's profile in a new tab
        window.open(`/${profileData.username}`, "_blank");
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

  const isButtonDisabled = false;

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
      <nav className="flex h-[72px] w-full shrink-0 items-center justify-between border-b border-white/5 bg-dashboard-bg pr-5 pl-16 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {!isUserProfile && (
            <h1 className="shrink-0 font-utsaha text-xl tracking-wide text-white">
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

        <div className="flex items-center gap-3 md:gap-5">
          {/* Notification bell */}
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white/60 transition-all duration-200 hover:bg-white/5 hover:text-white"
            aria-label="Notifications"
          >
            <FiBell size={22} />
          </button>

          {/* ── Create Profile / New Token / icon-only on /discover ──
              Public profiles are read-only surfaces, so no create action. */}
          {!isUserProfile && (
            <Button
              className={`flex items-center justify-center rounded-full border-none font-utsaha shadow-none transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                isDashboard && hasProfile
                  ? "bg-landing-bg text-dashboard-bg hover:bg-landing-bg/90"
                  : "bg-brand-green text-dashboard-bg hover:bg-brand-green/90"
              } ${
                isDiscover
                  ? "h-10 w-10 p-0"
                  : "gap-2.5 px-4 py-2.5 text-base md:px-5 md:text-xl"
              } ${!isConnected ? "cursor-not-allowed opacity-50" : ""}`}
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
              disabled={!isConnected}
            >
              {!(isDashboard && hasProfile) && (
                <FiPlus size={20} className="shrink-0" strokeWidth={3} />
              )}
              {!isDiscover && <span>{getButtonLabel()}</span>}
            </Button>
          )}
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
