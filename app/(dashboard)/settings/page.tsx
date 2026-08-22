"use client";

import React from "react";
import { useIdentityGate } from "@/hooks/useIdentityGate";

export default function SettingsPage() {
  const { isConnected, hasProfile, profileData, address } = useIdentityGate();

  return (
    <main className="flex flex-col gap-6 px-4 pt-9 pb-12 sm:px-6 md:pr-14 md:pl-10">
      <div className="w-full overflow-hidden rounded-2xl border border-card-border bg-card-bg p-6">
        <h2 className="mb-4 font-utsaha text-xl text-white md:text-2xl">
          Settings
        </h2>

        {!isConnected ? (
          <p className="font-utsaha text-gray-400">
            Connect your wallet to view settings
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Connected Wallet */}
            <div className="flex flex-col gap-1.5">
              <span className="font-utsaha text-sm text-gray-400">
                Connected Wallet
              </span>
              <span className="font-mono text-sm text-white break-all">
                {address}
              </span>
            </div>

            {/* Profile Status */}
            <div className="flex flex-col gap-1.5">
              <span className="font-utsaha text-sm text-gray-400">
                Profile Status
              </span>
              <span className="font-utsaha text-sm text-white">
                {hasProfile ? (
                  <span className="text-brand-green">✓ Profile Created</span>
                ) : (
                  <span className="text-yellow-400">
                    No profile yet — create one from the Dashboard
                  </span>
                )}
              </span>
            </div>

            {/* Profile Info */}
            {hasProfile && profileData && (
              <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
                <h3 className="font-utsaha text-lg text-gray-300">
                  Your Profile
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <SettingsField label="Name" value={profileData.name} />
                  <SettingsField
                    label="Username"
                    value={profileData.username}
                  />
                  {profileData.email && (
                    <SettingsField label="Email" value={profileData.email} />
                  )}
                  {profileData.github && (
                    <SettingsField label="GitHub" value={profileData.github} />
                  )}
                  {profileData.discord && (
                    <SettingsField
                      label="Discord"
                      value={profileData.discord}
                    />
                  )}
                  {profileData.xDotCom && (
                    <SettingsField
                      label="X (Twitter)"
                      value={profileData.xDotCom}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Coming Soon */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
              <p className="font-utsaha text-sm text-gray-500">
                Profile editing and advanced settings coming soon
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function SettingsField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-utsaha text-xs text-gray-500">{label}</span>
      <span className="font-utsaha text-sm text-white">{value}</span>
    </div>
  );
}
