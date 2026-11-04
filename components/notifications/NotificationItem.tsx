"use client";

import React from "react";
import Link from "next/link";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiFlag,
  FiHeart,
  FiXCircle,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import {
  describe,
  type AppNotification,
  type NotificationKind,
} from "@/lib/notifications";
import { formatTimeAgo } from "@/lib/helpers";

const ICONS: Record<NotificationKind, IconType> = {
  attested: FiCheckCircle,
  revoked: FiXCircle,
  received: FiDownload,
  flagged: FiFlag,
  autoFlagged: FiAlertTriangle,
  attestedMoved: FiArrowRight,
  devFee: FiHeart,
  devFeeReceiver: FiHeart,
  gap: FiClock,
};

interface NotificationItemProps {
  item: AppNotification;
  isNew: boolean;
  /** Called when the row's link is followed */
  onNavigate: () => void;
}

/** One notification: icon, text and age; links to the wallet that acted. */
export function NotificationItem({
  item,
  isNew,
  onNavigate,
}: NotificationItemProps) {
  const Icon = ICONS[item.kind];
  const className = `flex gap-3 px-4 py-3 ${isNew ? "bg-white/[0.03]" : ""}`;

  const body = (
    <>
      <Icon
        size={16}
        aria-hidden
        className={`mt-0.5 shrink-0 ${isNew ? "text-brand-green" : "text-gray-500"}`}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm break-words text-gray-200">
          {describe(item)}
        </span>
        <span className="block text-xs text-gray-500">
          {formatTimeAgo(BigInt(item.at))}
        </span>
      </span>
    </>
  );

  return (
    <li className="border-b border-white/5 last:border-b-0">
      {item.actor ? (
        <Link
          href={`/wallet?u=${item.actor}`}
          onClick={onNavigate}
          className={`${className} transition-colors hover:bg-white/5`}
        >
          {body}
        </Link>
      ) : (
        <div className={className}>{body}</div>
      )}
    </li>
  );
}
