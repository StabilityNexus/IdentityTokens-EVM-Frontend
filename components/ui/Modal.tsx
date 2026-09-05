"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Rendered as the dialog heading and wired to aria-labelledby. */
  title: React.ReactNode;
  /** Optional line under the title. */
  subtitle?: React.ReactNode;
  /** Id for the heading element; pass one from useId() in the caller. */
  titleId: string;
  /** Tailwind max-width for the panel. Defaults to a small dialog. */
  widthClassName?: string;
  children: React.ReactNode;
}

/**
 * The overlay, panel, close button and focus management shared by every modal.
 *
 * Focus handling is the reason this exists: each modal previously re-declared
 * the same trap, and most of them simply left it out, so Tab walked straight
 * into the page behind the dialog.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  titleId,
  widthClassName = "max-w-md",
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Keep the latest onClose without making the effect depend on it, so a caller
  // passing an inline arrow does not tear down and rebuild the trap every render.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  // Escape to dismiss, plus focus management: pull focus into the dialog, keep
  // Tab cycling inside it, and hand focus back to the opener on close.
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((element) => element.getClientRects().length > 0);

    const initial = focusable();
    const firstField = initial.find((element) =>
      ["INPUT", "SELECT", "TEXTAREA"].includes(element.tagName)
    );
    (firstField ?? initial[0])?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const cycle = focusable();
      if (cycle.length === 0) return;

      const first = cycle[0];
      const last = cycle[cycle.length - 1];
      const active = document.activeElement;
      const escaped = !dialogRef.current?.contains(active);

      if (event.shiftKey && (active === first || escaped)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || escaped)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "animate-in zoom-in-95 relative w-full rounded-2xl p-6 shadow-2xl duration-200 md:p-8",
          widthClassName
        )}
        style={{
          backgroundColor: "var(--color-app-bg)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 id={titleId} className="font-utsaha text-2xl text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 font-utsaha text-sm text-gray-400">{subtitle}</p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}

export default Modal;
