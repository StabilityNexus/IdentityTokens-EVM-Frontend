"use client";

import React from "react";
import { Shuffle } from "lucide-react";
import { AVATAR_PRESETS, getRandomAvatarId } from "@/lib/avatars";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface AvatarPickerProps {
  value: string | null;
  onChange: (avatarId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function AvatarPicker({
  value,
  onChange,
  disabled = false,
  className,
}: AvatarPickerProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="font-utsaha text-sm text-gray-300">
          Avatar<span className="ml-0.5 text-red-400">*</span>
        </span>
        <button
          type="button"
          onClick={() => onChange(getRandomAvatarId(value))}
          disabled={disabled}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 font-utsaha text-xs text-gray-300 transition-colors hover:border-profile-accent/50 hover:text-white disabled:opacity-50"
        >
          <Shuffle size={13} />
          Randomize
        </button>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-white/8 bg-modal-inner-bg p-4 sm:flex-row sm:items-center">
        {/* Selected preview */}
        <div className="flex shrink-0 justify-center sm:justify-start">
          <div className="h-20 w-20 overflow-hidden rounded-2xl ring-2 ring-profile-accent/50">
            <Avatar avatarId={value} />
          </div>
        </div>

        {/* Preset grid */}
        <div
          role="radiogroup"
          aria-label="Choose an avatar"
          className="grid flex-1 grid-cols-6 gap-2 xs:gap-2.5 sm:grid-cols-8"
        >
          {AVATAR_PRESETS.map((preset) => {
            const isSelected = preset.id === value;
            return (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={preset.label}
                title={preset.label}
                disabled={disabled}
                onClick={() => onChange(preset.id)}
                className={cn(
                  "aspect-square overflow-hidden rounded-lg transition-all",
                  "hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-profile-accent",
                  isSelected
                    ? "ring-2 ring-profile-accent ring-offset-2 ring-offset-modal-inner-bg"
                    : "opacity-60 hover:opacity-100",
                  disabled && "cursor-not-allowed",
                )}
              >
                <Avatar avatarId={preset.id} shape="squircle" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AvatarPicker;