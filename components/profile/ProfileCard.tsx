"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  title?: string;
  /** Optional element pinned to the right of the title row. */
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

export function ProfileCard({
  title,
  action,
  className,
  bodyClassName,
  children,
}: ProfileCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-profile-border bg-profile-surface",
        className,
      )}
    >
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-profile-border px-5 py-3.5">
          <h2 className="font-utsaha text-base text-white">{title}</h2>
          {action}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export default ProfileCard;