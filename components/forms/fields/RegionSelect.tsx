"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { RegionIcon } from "@/components/ui/RegionIcon";
import {
  COUNTRIES,
  MAX_REGIONS,
  MAX_REGION_NAME_LENGTH,
  Region,
  customRegion,
  encodeRegions,
  findCountryByName,
  isSameRegion,
  parseRegions,
} from "@/lib/countries";
import { cn } from "@/lib/utils";

interface RegionSelectProps {
  /** Stored regions string, see `parseRegions`. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function RegionSelect({
  value,
  onChange,
  disabled = false,
  className,
}: RegionSelectProps) {
  const reactId = useId();
  const labelId = `region-label-${reactId}`;
  const listboxId = `region-list-${reactId}`;
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const selected = useMemo(() => parseRegions(value), [value]);
  const isFull = selected.length >= MAX_REGIONS;

  const isSelected = (region: Region) =>
    selected.some((picked) => isSameRegion(picked, region));

  // Matching countries, then the typed text as a custom region unless it
  // names a listed country or is already picked.
  const needle = query.trim().toLowerCase();
  const countries = needle
    ? COUNTRIES.filter((country) => country.name.toLowerCase().includes(needle))
    : COUNTRIES;
  const custom = customRegion(query);
  const options: readonly Region[] =
    custom && !findCountryByName(custom.name) && !isSelected(custom)
      ? [...countries, custom]
      : countries;

  // Close on outside click.
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  // Focus the search box once the panel is actually on screen.
  useEffect(() => {
    if (!isOpen) return;
    searchRef.current?.focus();
  }, [isOpen]);

  // Keep the highlighted option in view while arrowing through the list.
  useEffect(() => {
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const toggleOpen = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    setQuery("");
    setActiveIndex(0);
    setIsOpen(true);
  };

  // The panel stays open so several regions can be picked in one go.
  const toggle = (region: Region) => {
    if (isSelected(region)) {
      onChange(
        encodeRegions(
          selected.filter((picked) => !isSameRegion(picked, region))
        )
      );
      return;
    }
    if (isFull) return;
    onChange(encodeRegions([...selected, region]));
    if (!region.code) {
      setQuery("");
      setActiveIndex(0);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      // Marked handled so the modal around it stays open.
      event.preventDefault();
      setIsOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const region = options[activeIndex];
      if (region) toggle(region);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col gap-1.5", className)}
    >
      <span id={labelId} className="font-utsaha text-sm text-gray-300">
        Regions
      </span>

      <div className="relative">
        <div
          role="group"
          aria-labelledby={labelId}
          className={cn(
            "flex flex-wrap items-center gap-1.5 rounded-xl border border-white/8 bg-modal-inner-bg px-2 py-1.5 transition-colors",
            isOpen && "border-profile-accent/70",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          {selected.map((region) => (
            <span
              key={region.code ?? `~${region.name}`}
              className="flex max-w-full items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1 pr-1 pl-2 font-utsaha text-sm text-white"
            >
              <RegionIcon region={region} />
              <span className="min-w-0 truncate">{region.name}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => toggle(region)}
                aria-label={`Remove ${region.name}`}
                className="rounded p-0.5 text-gray-500 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none"
              >
                <X size={12} />
              </button>
            </span>
          ))}

          <button
            type="button"
            disabled={disabled}
            onClick={toggleOpen}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            className="flex min-w-32 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-left focus:ring-1 focus:ring-profile-accent/40 focus:outline-none disabled:cursor-not-allowed"
          >
            <span className="min-w-0 flex-1 truncate font-utsaha text-gray-600">
              {selected.length === 0 ? "Select regions" : "Add region"}
            </span>
            <ChevronDown
              size={16}
              className={cn(
                "shrink-0 text-gray-500 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-modal-border bg-app-bg shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/8 px-3 py-2">
              <Search size={14} className="shrink-0 text-gray-500" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                maxLength={MAX_REGION_NAME_LENGTH}
                placeholder="Search or type a region…"
                aria-label="Search or type a region"
                role="combobox"
                aria-expanded
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={
                  options[activeIndex] ? optionId(activeIndex) : undefined
                }
                className="w-full bg-transparent font-utsaha text-sm text-white placeholder-gray-600 focus:outline-none"
              />
            </div>

            {isFull && (
              <p className="border-b border-white/8 px-3 py-2 font-utsaha text-xs text-amber-400">
                {MAX_REGIONS} regions is the limit. Remove one to add another.
              </p>
            )}

            <ul
              id={listboxId}
              role="listbox"
              aria-label="Regions"
              aria-multiselectable
              className="no-scrollbar max-h-56 overflow-y-auto py-1"
            >
              {options.length === 0 && (
                <li className="px-3 py-4 text-center font-utsaha text-sm text-gray-500">
                  Type a region name to add it.
                </li>
              )}

              {options.map((region, index) => {
                const picked = isSelected(region);
                const unavailable = !picked && isFull;
                return (
                  <li
                    key={region.code ?? `~${region.name}`}
                    ref={(element) => {
                      optionRefs.current[index] = element;
                    }}
                    id={optionId(index)}
                    role="option"
                    aria-selected={picked}
                    aria-disabled={unavailable}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => toggle(region)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 px-3 py-2 font-utsaha text-sm transition-colors",
                      index === activeIndex ? "bg-white/6" : "bg-transparent",
                      picked ? "text-profile-accent-soft" : "text-gray-200",
                      unavailable && "cursor-not-allowed opacity-40"
                    )}
                  >
                    {region.code ? (
                      <RegionIcon region={region} />
                    ) : (
                      <Plus size={14} className="shrink-0 text-gray-400" />
                    )}
                    <span className="min-w-0 flex-1 truncate">
                      {region.code ? (
                        region.name
                      ) : (
                        <>Add &ldquo;{region.name}&rdquo; as a custom region</>
                      )}
                    </span>
                    {picked && (
                      <Check
                        size={14}
                        className="shrink-0 text-profile-accent"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <p className="font-utsaha text-xs text-gray-500">
        Pick from the list or type your own. Up to {MAX_REGIONS}.
      </p>
    </div>
  );
}

export default RegionSelect;
