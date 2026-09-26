"use client";

import React, { useId } from "react";
import { Check, Loader2, X } from "lucide-react";
import {
  AvailabilityStatus,
  UsernameAvailability,
} from "@/hooks/useUsernameAvailability";
import { cn } from "@/lib/utils";

const INPUT_BORDER: Record<AvailabilityStatus, string> = {
  idle: "border-corner-stroke dark:border-corner-stroke-dark",
  checking: "border-corner-stroke dark:border-corner-stroke-dark",
  available: "border-emerald-500 dark:border-brand-green/70",
  invalid: "border-red-400 dark:border-red-500/70",
  taken: "border-red-400 dark:border-red-500/70",
  error: "border-amber-400 dark:border-amber-400/70",
};

interface UsernameFieldProps {
  value: string;
  onChange: (value: string) => void;
  availability: UsernameAvailability;
  disabled?: boolean;
}

export function UsernameField({
  value,
  onChange,
  availability,
  disabled = false,
}: UsernameFieldProps) {
  const inputId = useId();
  const statusId = useId();
  const { status } = availability;

  return (
    <div className="w-full max-w-md">
      <label htmlFor={inputId} className="sr-only">
        Username
      </label>
      <div
        className={cn(
          "flex items-center rounded-2xl border bg-white/70 px-4 shadow-sm transition-colors focus-within:ring-4 focus-within:ring-brand-blue/15 dark:bg-white/5",
          INPUT_BORDER[status]
        )}
      >
        <span
          aria-hidden="true"
          className="font-utsaha text-lg text-black/40 dark:text-white/40"
        >
          @
        </span>
        <input
          id={inputId}
          name="username"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="yourname"
          maxLength={32}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          disabled={disabled}
          aria-describedby={statusId}
          aria-invalid={status === "invalid" || status === "taken"}
          className="h-14 min-w-0 flex-1 bg-transparent px-1.5 font-utsaha text-lg text-black outline-none placeholder:text-black/30 disabled:opacity-60 dark:text-white dark:placeholder:text-white/30"
        />
        <AvailabilityIcon status={status} />
      </div>

      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className="mt-2 min-h-5 font-utsaha text-sm"
      >
        <AvailabilityMessage username={value} availability={availability} />
      </p>
    </div>
  );
}

function AvailabilityIcon({ status }: { status: AvailabilityStatus }) {
  if (status === "checking") {
    return (
      <Loader2
        size={18}
        className="shrink-0 animate-spin text-black/40 dark:text-white/40"
        aria-hidden="true"
      />
    );
  }
  if (status === "available") {
    return (
      <Check
        size={18}
        className="shrink-0 text-emerald-600 dark:text-brand-green"
        aria-hidden="true"
      />
    );
  }
  if (status === "taken" || status === "invalid") {
    return (
      <X
        size={18}
        className="shrink-0 text-red-500 dark:text-red-400"
        aria-hidden="true"
      />
    );
  }
  return null;
}

function AvailabilityMessage({
  username,
  availability,
}: {
  username: string;
  availability: UsernameAvailability;
}) {
  const { status, message, retry } = availability;

  switch (status) {
    case "idle":
      return null;
    case "checking":
      return (
        <span className="text-gray-500 dark:text-gray-400">
          Checking @{username}…
        </span>
      );
    case "available":
      return (
        <span className="text-emerald-700 dark:text-brand-green">
          @{username} is available.
        </span>
      );
    case "taken":
      return (
        <span className="text-red-600 dark:text-red-400">
          @{username} is already taken. Try another.
        </span>
      );
    case "invalid":
      return <span className="text-red-600 dark:text-red-400">{message}</span>;
    case "error":
      return (
        <span className="text-amber-700 dark:text-text-warning">
          {message}{" "}
          <button
            type="button"
            onClick={retry}
            className="cursor-pointer underline underline-offset-2"
          >
            Retry
          </button>
        </span>
      );
  }
}

export default UsernameField;
