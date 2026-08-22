"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { COUNTRIES, countryFlag, findCountryByName } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface CountrySelectProps {
  label?: string;
  value: string;
  onChange: (name: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function CountrySelect({
  label = "Country",
  value,
  onChange,
  disabled = false,
  required = false,
  className,
}: CountrySelectProps) {
  const reactId = useId();
  const listboxId = `country-list-${reactId}`;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const selected = findCountryByName(value);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return COUNTRIES;
    return COUNTRIES.filter((country) =>
      country.name.toLowerCase().includes(needle)
    );
  }, [query]);

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

  // Reset filtering and highlight the current selection as the panel opens.
  // Doing it here instead of in an effect keeps it to a single render pass.
  const toggleOpen = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    setQuery("");
    const index = selected
      ? COUNTRIES.findIndex((country) => country.code === selected.code)
      : 0;
    setActiveIndex(Math.max(index, 0));
    setIsOpen(true);
  };

  const commit = (name: string) => {
    onChange(name);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const country = results[activeIndex];
      if (country) commit(country.name);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col gap-1.5", className)}
    >
      <span className="font-utsaha text-sm text-gray-300">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </span>

      <button
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-white/8 bg-modal-inner-bg px-3 py-2.5 text-left transition-colors",
          "hover:border-white/15 focus:border-profile-accent/70 focus:ring-1 focus:ring-profile-accent/40 focus:outline-none",
          isOpen && "border-profile-accent/70",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        {selected && (
          <span aria-hidden="true" className="text-base leading-none">
            {countryFlag(selected.code)}
          </span>
        )}
        <span
          className={cn(
            "min-w-0 flex-1 truncate font-utsaha",
            value ? "text-white" : "text-gray-600"
          )}
        >
          {value || "Select a country"}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-gray-500 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

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
              placeholder="Search countries…"
              aria-label="Search countries"
              className="w-full bg-transparent font-utsaha text-sm text-white placeholder-gray-600 focus:outline-none"
            />
          </div>

          <ul
            id={listboxId}
            role="listbox"
            aria-label="Countries"
            className="no-scrollbar max-h-56 overflow-y-auto py-1"
          >
            {results.length === 0 && (
              <li className="px-3 py-4 text-center font-utsaha text-sm text-gray-500">
                No countries match &ldquo;{query}&rdquo;
              </li>
            )}

            {results.map((country, index) => {
              const isSelected = country.name === value;
              return (
                <li
                  key={country.code}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(country.name)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 px-3 py-2 font-utsaha text-sm transition-colors",
                    index === activeIndex ? "bg-white/6" : "bg-transparent",
                    isSelected ? "text-profile-accent-soft" : "text-gray-200"
                  )}
                >
                  <span aria-hidden="true" className="text-base leading-none">
                    {countryFlag(country.code)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {country.name}
                  </span>
                  {isSelected && (
                    <Check size={14} className="shrink-0 text-profile-accent" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CountrySelect;
