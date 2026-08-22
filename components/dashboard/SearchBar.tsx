"use client";

import React from "react";
import { FiSearch } from "react-icons/fi";
import { SearchBarProps } from "@/lib/types";

export function SearchBar({
  placeholder = "Search…",
  value,
  onChange,
  onSubmit,
  className = "",
}: SearchBarProps) {
  return (
    <div
      className={`flex flex-1 items-center gap-2 px-4 py-2 ${className}`}
      style={{
        backgroundColor: "var(--color-search-bg)",
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <FiSearch size={16} className="shrink-0 text-gray-500" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit?.();
        }}
        className="w-full bg-transparent font-utsaha text-sm text-white placeholder-gray-500 focus:outline-none"
      />
    </div>
  );
}
