"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { CircleCheck, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { TermsOfUse } from "./TermsOfUse";

interface TermsConsentProps {
  agreed: boolean;
  onAgreedChange: (agreed: boolean) => void;
  /** Shown while the terms are not accepted, e.g. after a blocked submit */
  error?: string;
  disabled?: boolean;
  /** "modal" for the dark dialogs, "page" for light-or-dark pages like /claim */
  variant?: "modal" | "page";
}

/** The Terms of Use open in a modal, and are accepted with the checkbox inside it. */
export function TermsConsent({
  agreed,
  onAgreedChange,
  error,
  disabled = false,
  variant = "modal",
}: TermsConsentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const isPage = variant === "page";
  const linkClass = `underline underline-offset-2 hover:opacity-80 ${
    isPage
      ? "text-brand-blue dark:text-brand-blue-link"
      : "text-brand-blue-link"
  }`;

  return (
    <div className="w-full text-left">
      <p
        className={`flex items-start gap-2.5 font-utsaha text-sm ${
          isPage ? "text-gray-600 dark:text-gray-300" : "text-gray-300"
        }`}
      >
        {agreed ? (
          <CircleCheck
            size={16}
            className="mt-0.5 shrink-0 text-brand-green"
            aria-hidden="true"
          />
        ) : (
          <FileText
            size={16}
            className="mt-0.5 shrink-0 text-gray-500"
            aria-hidden="true"
          />
        )}
        <span>
          {agreed ? "You accepted the " : "Read and accept the "}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            disabled={disabled}
            aria-haspopup="dialog"
            className={`cursor-pointer disabled:cursor-not-allowed ${linkClass}`}
          >
            Terms of Use
          </button>
          {agreed ? (
            <>
              {" "}
              and the{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Privacy Policy
              </Link>
              .
            </>
          ) : (
            " to continue."
          )}
        </span>
      </p>

      {error && !agreed && (
        <p
          role="alert"
          className={`mt-2 font-utsaha text-xs ${
            isPage ? "text-red-600 dark:text-red-400" : "text-red-400"
          }`}
        >
          {error}
        </p>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        titleId={titleId}
        title="Terms of Use"
        subtitle="Decentralized Identity Token (DIT)"
        widthClassName="max-w-2xl"
      >
        <div className="max-h-[50vh] overflow-y-auto pr-2">
          <TermsOfUse />
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-white/8 pt-5">
          <label className="flex cursor-pointer items-start gap-2.5 font-utsaha text-sm text-gray-300">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => onAgreedChange(event.target.checked)}
              disabled={disabled}
              required
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-brand-green"
            />
            <span>
              I have read and agree to the Terms of Use and the{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue-link underline underline-offset-2 hover:opacity-80"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={!agreed}
            className="rounded-xl bg-brand-green px-6 py-2.5 font-utsaha text-black transition-all hover:bg-brand-green/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default TermsConsent;
