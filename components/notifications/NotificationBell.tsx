"use client";

import React, { useState } from "react";
import { Popover } from "radix-ui";
import { FiBell } from "react-icons/fi";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationList } from "./NotificationList";

/** Past this, the badge shows "9+" so it stays one small circle. */
const BADGE_MAX = 9;

/** The navbar bell: unread badge, and a panel of on-chain activity. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { items, unread, isLoading, isError, isConnected, markRead, retry } =
    useNotifications();

  // Rows stay highlighted while open; closing the panel marks them read.
  const setOpenAndMark = (next: boolean) => {
    setOpen(next);
    if (!next) markRead();
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpenAndMark}>
      <Popover.Trigger asChild>
        <button
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/60 transition-all duration-200 hover:bg-white/5 hover:text-white data-[state=open]:bg-white/5 data-[state=open]:text-white sm:h-10 sm:w-10"
          aria-label={
            unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
          }
        >
          <FiBell size={18} className="sm:hidden" />
          <FiBell size={22} className="hidden sm:block" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-green px-1 font-utsaha text-[10px] leading-none text-dashboard-bg">
              {unread > BADGE_MAX ? `${BADGE_MAX}+` : unread}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={16}
          aria-label="Notifications"
          className="z-50 flex max-h-[min(480px,var(--radix-popover-content-available-height))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-dashboard-bg font-utsaha text-white shadow-2xl outline-none"
        >
          <h2 className="border-b border-white/5 px-4 py-3 text-base">
            Notifications
          </h2>
          <div className="min-h-0 overflow-y-auto">
            <NotificationList
              items={items}
              unread={unread}
              isLoading={isLoading}
              isError={isError}
              isConnected={isConnected}
              onRetry={retry}
              onNavigate={() => setOpenAndMark(false)}
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
