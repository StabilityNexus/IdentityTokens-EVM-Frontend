"use client";

import React, { useId } from "react";
import { AlertCircle, Check, Info, Loader2 } from "lucide-react";
import { FieldResult } from "@/lib/validation";
import { cn } from "@/lib/utils";

export interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  /** Live validation result — drives the border, icon and message. */
  result?: FieldResult;
  /** Called when the user accepts a suggested correction. */
  onApplySuggestion?: (suggestion: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "url" | "number";
  required?: boolean;
  disabled?: boolean;
  /** Static, non-editable prefix rendered inside the field (e.g. `@`). */
  prefix?: string;
  icon?: React.ReactNode;
  /** Always-visible helper text, shown when there is no validation message. */
  hint?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  className?: string;
}

const BORDER_BY_STATUS: Record<string, string> = {
  idle: "border-white/8",
  checking: "border-white/8",
  valid: "border-brand-green/45",
  warning: "border-amber-400/50",
  invalid: "border-red-500/55",
};

const TEXT_BY_STATUS: Record<string, string> = {
  valid: "text-brand-green",
  warning: "text-amber-400",
  invalid: "text-red-400",
  checking: "text-gray-400",
  idle: "text-gray-500",
};

export function TextField({
  label,
  name,
  value,
  onChange,
  result = { status: "idle" },
  onApplySuggestion,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  prefix,
  icon,
  hint,
  maxLength,
  min,
  max,
  className,
}: TextFieldProps) {
  const reactId = useId();
  const inputId = `${name}-${reactId}`;
  const messageId = `${inputId}-msg`;

  const { status, message, suggestion } = result;
  const showMessage = Boolean(message) || Boolean(hint);

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="font-utsaha text-sm text-gray-300">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>

      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-modal-inner-bg px-3 transition-colors",
          "focus-within:border-profile-accent/70 focus-within:ring-1 focus-within:ring-profile-accent/40",
          BORDER_BY_STATUS[status] ?? BORDER_BY_STATUS.idle,
          disabled && "opacity-60"
        )}
      >
        {icon && (
          <span className="shrink-0 text-gray-500" aria-hidden="true">
            {icon}
          </span>
        )}
        {prefix && (
          <span className="shrink-0 font-utsaha text-sm text-gray-500 select-none">
            {prefix}
          </span>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          min={min}
          max={max}
          aria-invalid={status === "invalid"}
          aria-describedby={showMessage ? messageId : undefined}
          autoComplete="off"
          spellCheck={false}
          className="w-full min-w-0 bg-transparent py-2.5 font-utsaha text-white placeholder-gray-600 focus:outline-none"
        />

        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          {status === "checking" && (
            <Loader2 size={15} className="animate-spin text-gray-400" />
          )}
          {status === "valid" && (
            <Check size={15} className="text-brand-green" />
          )}
          {status === "warning" && (
            <Info size={15} className="text-amber-400" />
          )}
          {status === "invalid" && (
            <AlertCircle size={15} className="text-red-400" />
          )}
        </span>
      </div>

      {showMessage && (
        <p
          id={messageId}
          className={cn(
            "flex flex-wrap items-center gap-1.5 font-utsaha text-xs",
            message ? TEXT_BY_STATUS[status] : "text-gray-500"
          )}
        >
          <span>{message ?? hint}</span>
          {suggestion && onApplySuggestion && (
            <button
              type="button"
              onClick={() => onApplySuggestion(suggestion)}
              className="rounded-md border border-profile-accent/40 bg-profile-accent/10 px-1.5 py-0.5 text-profile-accent-soft transition-colors hover:bg-profile-accent/20"
            >
              Use &ldquo;{suggestion}&rdquo;
            </button>
          )}
        </p>
      )}
    </div>
  );
}

export default TextField;
