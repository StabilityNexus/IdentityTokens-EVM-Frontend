"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { countryFlag, findCountryByName } from "@/lib/countries";

interface ProfileHeaderProps {
  name: string;
  username: string;
  avatarId: string | null;
  /** Fallback seed for profiles created before avatars existed. */
  seed: string | null;
  nationality: string;
  /** Attest / revoke / share / copy cluster. */
  actions: React.ReactNode;
}

export function ProfileHeader({
  name,
  username,
  avatarId,
  seed,
  nationality,
  actions,
}: ProfileHeaderProps) {
  const regions = parseRegions(nationality);

  return (
    <header className="overflow-hidden rounded-2xl border border-profile-border bg-profile-surface">
      {/* Cover */}
      <div className="gradient-profile-cover h-24 w-full sm:h-32 md:h-36" />

      <div className="px-4 pb-5 sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          {/* Avatar + name */}
          <div className="flex min-w-0 items-end gap-4">
            <div className="-mt-10 h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-4 ring-profile-surface sm:-mt-14 sm:h-28 sm:w-28">
              <Avatar avatarId={avatarId} seed={seed} />
            </div>

            <div className="min-w-0 pb-0.5">
              <h1 className="truncate font-utsaha text-2xl leading-tight text-white sm:text-3xl">
                {name}
              </h1>
              <p className="truncate font-utsaha text-sm text-profile-accent-soft sm:text-base">
                @{username}
              </p>
            </div>
          </div>

          <div className="lg:pb-1">{actions}</div>
        </div>

        {/* Meta row */}
        {nationality && (
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-profile-border pt-4">
            <span className="flex items-center gap-1.5 font-utsaha text-sm text-gray-400">
              {country ? (
                <span aria-hidden="true">{countryFlag(country.code)}</span>
              ) : (
                <MapPin size={14} />
              )}
              {nationality}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

export default ProfileHeader;
