"use client";

import React from "react";
import { LinkIcon, Plus, Trash2 } from "lucide-react";
import {
  CustomLink,
  MAX_LINK_LABEL_LENGTH,
  MAX_LINK_URL_LENGTH,
  nextLinkKey,
} from "@/lib/profileData";
import { validateWebsite } from "@/lib/validation";
import { cn } from "@/lib/utils";

/**
 * The error shown for one row, or undefined when the row is fine.
 *
 * Exported so the owning form can gate submission on the same rule the field
 * renders, rather than duplicating it or reporting validity back up through a
 * callback and an effect.
 */
export function customLinkError(link: CustomLink): string | undefined {
  const urlResult = link.url ? validateWebsite(link.url) : undefined;
  if (urlResult?.status === "invalid") return urlResult.message;
  if (!link.label.trim() && link.url.trim()) return "Give this link a name.";
  return undefined;
}

/** True when any row is showing an error and submission should be blocked. */
export function hasCustomLinkError(links: CustomLink[]): boolean {
  return links.some((link) => customLinkError(link) !== undefined);
}

interface CustomLinksFieldProps {
  links: CustomLink[];
  onChange: (links: CustomLink[]) => void;
  disabled?: boolean;
  className?: string;
}

export function CustomLinksField({
  links,
  onChange,
  disabled = false,
  className,
}: CustomLinksFieldProps) {
  const updateRow = (position: number, patch: Partial<CustomLink>) => {
    onChange(
      links.map((link, i) => (i === position ? { ...link, ...patch } : link))
    );
  };

  // The remaining rows keep their indexes, so removing a link clears exactly
  // one on-chain entry rather than shifting every link after it.
  const removeRow = (position: number) => {
    onChange(links.filter((_, i) => i !== position));
  };

  const addRow = () => {
    onChange([...links, { label: "", url: "", index: nextLinkKey(links) }]);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="font-utsaha text-sm text-gray-300">
          Custom links <span className="text-gray-500">({links.length})</span>
        </span>
        <button
          type="button"
          onClick={addRow}
          disabled={disabled}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 font-utsaha text-xs text-gray-300 transition-colors hover:border-profile-accent/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={13} />
          Add link
        </button>
      </div>

      {links.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center font-utsaha text-xs text-gray-500">
          Add Farcaster, Lens, Telegram, a blog — anything not covered above.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {links.map((link, position) => {
            const error = customLinkError(link);

            return (
              <div key={link.index} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(event) =>
                      updateRow(position, { label: event.target.value })
                    }
                    placeholder="Name"
                    maxLength={MAX_LINK_LABEL_LENGTH}
                    disabled={disabled}
                    aria-label={`Custom link ${position + 1} name`}
                    className="w-28 shrink-0 rounded-xl border border-white/8 bg-modal-inner-bg px-3 py-2.5 font-utsaha text-sm text-white placeholder-gray-600 transition-colors focus:border-profile-accent/70 focus:outline-none sm:w-36"
                  />

                  <div
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-2 rounded-xl border bg-modal-inner-bg px-3 transition-colors focus-within:border-profile-accent/70",
                      error ? "border-red-500/55" : "border-white/8"
                    )}
                  >
                    <LinkIcon size={14} className="shrink-0 text-gray-500" />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(event) =>
                        updateRow(position, { url: event.target.value })
                      }
                      placeholder="https://…"
                      maxLength={MAX_LINK_URL_LENGTH}
                      disabled={disabled}
                      aria-label={`Custom link ${position + 1} URL`}
                      aria-invalid={!!error}
                      className="w-full min-w-0 bg-transparent py-2.5 font-utsaha text-sm text-white placeholder-gray-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeRow(position)}
                    disabled={disabled}
                    aria-label={`Remove custom link ${position + 1}`}
                    className="shrink-0 rounded-lg p-2.5 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {error && (
                  <span className="pl-1 font-utsaha text-xs text-red-400">
                    {error}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CustomLinksField;
