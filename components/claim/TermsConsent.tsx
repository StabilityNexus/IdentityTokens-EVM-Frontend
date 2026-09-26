"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { TERMS_SUMMARY } from "@/lib/constants";

interface TermsConsentProps {
  agreed: boolean;
  onAgreedChange: (agreed: boolean) => void;
  showNudge: boolean;
  disabled?: boolean;
}

// Terms are shown in place rather than linked away to, as in onboarding.
export function TermsConsent({
  agreed,
  onAgreedChange,
  showNudge,
  disabled = false,
}: TermsConsentProps) {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="w-full max-w-md text-left">
      <label className="flex cursor-pointer items-start gap-2.5 font-utsaha text-sm text-gray-600 dark:text-gray-300">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => onAgreedChange(event.target.checked)}
          disabled={disabled}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-brand-blue dark:accent-brand-green"
        />
        <span>
          I agree to the{" "}
          <button
            type="button"
            onClick={() => setShowTerms((open) => !open)}
            aria-expanded={showTerms}
            className="cursor-pointer text-brand-blue underline underline-offset-2 hover:opacity-80 dark:text-brand-blue-link"
          >
            Terms
          </button>{" "}
          and the{" "}
          <Link
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-blue underline underline-offset-2 hover:opacity-80 dark:text-brand-blue-link"
          >
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <AnimatePresence initial={false}>
        {showTerms && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 list-disc space-y-2 overflow-hidden rounded-xl border border-corner-stroke bg-white/60 px-6 py-3.5 font-utsaha text-xs leading-relaxed text-gray-600 dark:border-corner-stroke-dark dark:bg-white/5 dark:text-gray-400"
          >
            {TERMS_SUMMARY.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {showNudge && !agreed && (
        <p className="mt-2 font-utsaha text-xs text-red-600 dark:text-red-400">
          Accept the terms to reserve your username.
        </p>
      )}
    </div>
  );
}

export default TermsConsent;
