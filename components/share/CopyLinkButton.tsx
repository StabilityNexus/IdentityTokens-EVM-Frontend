"use client";

import React, { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyLinkButtonProps {
  url: string;
  label?: string;
  className?: string;
}

/** Copies a link and says so for a moment. */
export function CopyLinkButton({
  url,
  label = "Copy link",
  className,
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    navigator.clipboard?.writeText(url).then(
      () => setCopied(true),
      () => undefined
    );
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-utsaha text-sm text-white transition-colors hover:bg-white/10",
        className
      )}
    >
      {copied ? (
        <Check size={16} className="text-brand-green" aria-hidden="true" />
      ) : (
        <Copy size={16} aria-hidden="true" />
      )}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}

export default CopyLinkButton;
