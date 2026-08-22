"use client";

import React from "react";
import { LinkIcon, Plus, Trash2 } from "lucide-react";
import { CustomLink, MAX_CUSTOM_LINKS } from "@/lib/profileExtras";
import { validateWebsite } from "@/lib/validation";
import { cn } from "@/lib/utils";

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
  const canAddMore = links.length < MAX_CUSTOM_LINKS;

  const updateRow = (index: number, patch: Partial<CustomLink>) => {
    onChange(
      links.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    );
  };

  const removeRow = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const addRow = () => {
    if (canAddMore) onChange([...links, { label: "", url: "" }]);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="font-utsaha text-sm text-gray-300">
          Custom links{" "}
          <span className="text-gray-500">
            ({links.length}/{MAX_CUSTOM_LINKS})
          </span>
        </span>
        <button
          type="button"
          onClick={addRow}
          disabled={disabled || !canAddMore}
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
          {links.map((link, index) => {
            const urlResult = link.url ? validateWebsite(link.url) : undefined;
            const labelMissing = !link.label.trim() && !!link.url.trim();
            const error =
              urlResult?.status === "invalid"
                ? urlResult.message
                : labelMissing
                  ? "Give this link a name."
                  : undefined;

            return (
              <div key={index} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(event) =>
                      updateRow(index, { label: event.target.value })
                    }
                    placeholder="Name"
                    maxLength={24}
                    disabled={disabled}
                    aria-label={`Custom link ${index + 1} name`}
                    className="w-28 shrink-0 rounded-xl border border-white/8 bg-modal-inner-bg px-3 py-2.5 font-utsaha text-sm text-white placeholder-gray-600 transition-colors focus:border-profile-accent/70 focus:outline-none sm:w-36"
                  />

                  <div
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-2 rounded-xl border bg-modal-inner-bg px-3 transition-colors focus-within:border-profile-accent/70",
                      error ? "border-red-500/55" : "border-white/8",
                    )}
                  >
                    <LinkIcon size={14} className="shrink-0 text-gray-500" />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(event) =>
                        updateRow(index, { url: event.target.value })
                      }
                      placeholder="https://…"
                      maxLength={200}
                      disabled={disabled}
                      aria-label={`Custom link ${index + 1} URL`}
                      aria-invalid={!!error}
                      className="w-full min-w-0 bg-transparent py-2.5 font-utsaha text-sm text-white placeholder-gray-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    disabled={disabled}
                    aria-label={`Remove custom link ${index + 1}`}
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