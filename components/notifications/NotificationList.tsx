"use client";

import React from "react";
import type { AppNotification } from "@/lib/notifications";
import { NotificationItem } from "./NotificationItem";

interface NotificationListProps {
  items: AppNotification[];
  /** The first `unread` items are new; items are sorted newest first */
  unread: number;
  isLoading: boolean;
  isError: boolean;
  isConnected: boolean;
  onRetry: () => void;
  onNavigate: () => void;
}

const MESSAGE = "px-4 py-6 text-sm text-gray-400";

/** The panel body: loading, error and empty states, then the rows. */
export function NotificationList({
  items,
  unread,
  isLoading,
  isError,
  isConnected,
  onRetry,
  onNavigate,
}: NotificationListProps) {
  if (isLoading) return <p className={MESSAGE}>Loading…</p>;

  if (isError) {
    return (
      <div className={`${MESSAGE} flex items-center justify-between gap-3`}>
        <span>Couldn&apos;t load activity.</span>
        <button onClick={onRetry} className="text-brand-green hover:underline">
          Retry
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className={MESSAGE}>
        {isConnected
          ? "Nothing yet. Activity on your tokens shows up here."
          : "Connect a wallet to see activity on your tokens."}
      </p>
    );
  }

  return (
    <ul>
      {items.map((item, i) => (
        <NotificationItem
          key={item.id}
          item={item}
          isNew={i < unread}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  );
}
