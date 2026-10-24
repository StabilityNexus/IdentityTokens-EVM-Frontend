"use client";

import React, { useId } from "react";
import { Check, X } from "lucide-react";
import { FieldResult, FieldStatus } from "@/lib/validation";
import { cn } from "@/lib/utils";

const INPUT_BORDER: Partial<Record<FieldStatus, string>> = {
  valid: "border-emerald-500 dark:border-brand-green/70",
  invalid: "border-red-400 dark:border-red-500/70",
};

const NEUTRAL_BORDER = "border-corner-stroke dark:border-corner-stroke-dark";

interface UsernameFieldProps {
  value: string;
  onChange: (value: string) => void;
  validation: FieldResult;
  disabled?: boolean;
}

export function UsernameField({
  value,
  onChange,
  validation,
  disabled = false,
}: UsernameFieldProps) {
  const inputId = useId();
  const statusId = useId();
  const { status, message } = validation;

  return (
    <div className="w-full max-w-md">
      <label htmlFor={inputId} className="sr-only">
        Username
      </label>
      <div
        className={cn(
          "flex items-center rounded-2xl border bg-white/70 px-4 shadow-sm transition-colors focus-within:ring-4 focus-within:ring-brand-blue/15 dark:bg-white/5",
          INPUT_BORDER[status] ?? NEUTRAL_BORDER
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
          aria-invalid={status === "invalid"}
          className="h-14 min-w-0 flex-1 bg-transparent px-1.5 font-utsaha text-lg text-black outline-none placeholder:text-black/30 disabled:opacity-60 dark:text-white dark:placeholder:text-white/30"
        />
        {status === "valid" && (
          <Check
            size={18}
            className="shrink-0 text-emerald-600 dark:text-brand-green"
            aria-hidden="true"
          />
        )}
        {status === "invalid" && (
          <X
            size={18}
            className="shrink-0 text-red-500 dark:text-red-400"
            aria-hidden="true"
          />
        )}
      </div>

      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className="mt-2 min-h-5 font-utsaha text-sm"
      >
        {status === "invalid" && (
          <span className="text-red-600 dark:text-red-400">{message}</span>
        )}
      </p>
    </div>
  );
}

export default UsernameField;
