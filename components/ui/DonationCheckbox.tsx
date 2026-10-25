"use client";

import React from "react";
import { useDevFee } from "@/hooks/useIdentityReads";
import { describeDevFee } from "@/lib/devFee";

interface DonationCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  chainId?: number;
  /** "modal" for the dark dialogs, "page" for light-or-dark pages like /claim */
  variant?: "modal" | "page";
  className?: string;
}

/** Pre-ticked opt-out for the donation to AOSSIE; hidden when devFee is 0. */
export function DonationCheckbox({
  checked,
  onChange,
  disabled = false,
  chainId,
  variant = "modal",
  className = "",
}: DonationCheckboxProps) {
  const { data: devFee } = useDevFee(chainId);
  if (!devFee) return null;

  return (
    <label
      className={`flex cursor-pointer items-start gap-2.5 font-utsaha text-sm ${
        variant === "page"
          ? "text-gray-600 dark:text-gray-300"
          : "text-gray-300"
      } ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className={`mt-0.5 h-4 w-4 shrink-0 cursor-pointer ${
          variant === "page"
            ? "accent-brand-blue dark:accent-brand-green"
            : "accent-brand-green"
        }`}
      />
      <span>
        Donate to AOSSIE
        <span className="block text-xs text-gray-500 dark:text-gray-400">
          {describeDevFee(devFee)}
        </span>
      </span>
    </label>
  );
}
