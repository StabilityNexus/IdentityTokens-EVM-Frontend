"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu } from "react-icons/fi";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "/assets/dashboard.svg" },
  { label: "Home", href: "/home", icon: "/assets/home.svg" },
  { label: "Discover", href: "/discover", icon: "/assets/discover.svg" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ open?: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.open === "boolean") {
        setIsMobileOpen(customEvent.detail.open);
      } else {
        setIsMobileOpen(true);
      }
    };
    document.addEventListener("openMobileSidebar", handleOpen);
    return () => document.removeEventListener("openMobileSidebar", handleOpen);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    if (isMobileOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  return (
    <>
      {/* ── Mobile Hamburger (if placed inside SideBar) ── */}
      <button
        type="button"
        aria-expanded={isMobileOpen}
        aria-label="Toggle mobile menu"
        className="fixed top-5 left-5 z-40 flex items-center justify-center text-white lg:hidden"
        onClick={() => setIsMobileOpen((prev) => !prev)}
      >
        <FiMenu size={24} />
      </button>

      {/* ── Mobile overlay ── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen flex-col overflow-x-hidden border-r border-white/5 bg-dashboard-bg transition-all duration-300 ease-in-out ${isCollapsed ? "w-[80px]" : "w-[250px]"} ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:z-auto lg:translate-x-0`}
      >
        {/* ─── Logo area ─── */}
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/5 px-5">
          {!isCollapsed && (
            <Link href="/home" className="flex items-center gap-3">
              <Image
                src="/assets/dark-logo.svg"
                alt="dit"
                width={32}
                height={32}
              />
              <span className="font-atyp text-2xl tracking-tight text-white">
                dit
              </span>
            </Link>
          )}

          {isCollapsed && (
            <Link href="/home" className="mx-auto">
              <Image
                src="/assets/dark-logo.svg"
                alt="dit"
                width={32}
                height={32}
              />
            </Link>
          )}
        </div>

        {/* ─── Navigation links ─── */}
        <nav className="no-scrollbar flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-3 py-6">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`group relative flex items-center gap-4 rounded-xl py-3 transition-all duration-200 ease-out ${
                  active
                    ? "bg-brand-blue text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                } ${isCollapsed ? "justify-center px-0" : "px-4"} `}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={22}
                  height={22}
                  className="shrink-0 brightness-0 invert"
                />

                {!isCollapsed && (
                  <span
                    className={`font-utsaha text-base whitespace-nowrap transition-colors duration-200 ${
                      active ? "text-white" : "font-utsaha"
                    }`}
                  >
                    {item.label}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <span className="pointer-events-none invisible absolute left-full z-50 ml-3 rounded-lg bg-[#2a2b30] px-3 py-1.5 font-utsaha text-sm whitespace-nowrap text-white opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ─── Bottom section: collapse toggle ─── */}
        <div className="mt-auto flex shrink-0 flex-col gap-2 px-3 pb-6">
          {/* Collapse/Expand toggle (desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden items-center justify-center gap-3 rounded-xl px-4 py-3 text-white/40 transition-all duration-200 hover:bg-white/5 hover:text-white lg:flex"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Image
              src="/assets/sidebarclose.svg"
              alt="Toggle sidebar"
              width={22}
              height={22}
              className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
            />
            {!isCollapsed && (
              <span className="font-utsaha text-sm whitespace-nowrap">
                Collapse
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
