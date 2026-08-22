"use client";

import React, { useState } from "react";
import { ArrowUpRight, Check, Copy, Globe, LinkIcon, Mail } from "lucide-react";
import { FaDiscord, FaGithub, FaXTwitter } from "react-icons/fa6";
import { ProfileCard } from "./ProfileCard";
import { CustomLink } from "@/lib/profileExtras";

interface ProfileLinksProps {
  github: string;
  xDotCom: string;
  discord: string;
  email: string;
  website: string;
  customLinks: CustomLink[];
  className?: string;
}

/** Build an absolute URL from a stored handle, tolerating legacy full URLs. */
function handleToUrl(base: string, handle: string): string {
  const clean = handle.replace(/^@/, "").trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  return `${base}${clean}`;
}

function normalizeExternal(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function ProfileLinks({
  github,
  xDotCom,
  discord,
  email,
  website,
  customLinks,
  className,
}: ProfileLinksProps) {
  const entries: React.ReactNode[] = [];

  if (github) {
    entries.push(
      <LinkTile
        key="github"
        icon={<FaGithub size={17} />}
        label="GitHub"
        value={`@${github.replace(/^@/, "")}`}
        href={handleToUrl("https://github.com/", github)}
      />,
    );
  }

  if (xDotCom) {
    entries.push(
      <LinkTile
        key="x"
        icon={<FaXTwitter size={16} />}
        label="X"
        value={`@${xDotCom.replace(/^@/, "")}`}
        href={handleToUrl("https://x.com/", xDotCom)}
      />,
    );
  }

  if (discord) {
    // Discord usernames aren't addressable by URL, so this tile copies instead.
    entries.push(
      <CopyTile
        key="discord"
        icon={<FaDiscord size={17} />}
        label="Discord"
        value={discord}
      />,
    );
  }

  if (email) {
    entries.push(
      <LinkTile
        key="email"
        icon={<Mail size={16} />}
        label="Email"
        value={email}
        href={`mailto:${email}`}
      />,
    );
  }

  if (website) {
    entries.push(
      <LinkTile
        key="website"
        icon={<Globe size={16} />}
        label="Website"
        value={website.replace(/^https?:\/\//i, "")}
        href={normalizeExternal(website)}
      />,
    );
  }

  customLinks.forEach((link, index) => {
    if (!link.url) return;
    entries.push(
      <LinkTile
        key={`custom-${index}`}
        icon={<LinkIcon size={16} />}
        label={link.label || "Link"}
        value={link.url.replace(/^https?:\/\//i, "")}
        href={normalizeExternal(link.url)}
      />,
    );
  });

  return (
    <ProfileCard title="Links" className={className}>
      {entries.length === 0 ? (
        <p className="py-4 text-center font-utsaha text-sm text-profile-muted">
          This profile hasn&rsquo;t added any links yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">{entries}</div>
      )}
    </ProfileCard>
  );
}

function LinkTile({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer me"
      className="group flex items-center gap-3 rounded-xl border border-profile-border bg-profile-surface-raised px-3.5 py-3 transition-colors hover:border-profile-accent/45"
    >
      <span className="shrink-0 text-profile-muted transition-colors group-hover:text-profile-accent-soft">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-utsaha text-[11px] tracking-wide text-profile-muted uppercase">
          {label}
        </span>
        <span className="block truncate font-utsaha text-sm text-white">
          {value}
        </span>
      </span>
      <ArrowUpRight
        size={15}
        className="shrink-0 text-profile-muted opacity-0 transition-opacity group-hover:opacity-100"
      />
    </a>
  );
}

function CopyTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — leave the value on screen to copy manually.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label} username`}
      className="group flex items-center gap-3 rounded-xl border border-profile-border bg-profile-surface-raised px-3.5 py-3 text-left transition-colors hover:border-profile-accent/45"
    >
      <span className="shrink-0 text-profile-muted transition-colors group-hover:text-profile-accent-soft">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-utsaha text-[11px] tracking-wide text-profile-muted uppercase">
          {label}
        </span>
        <span className="block truncate font-utsaha text-sm text-white">
          {value}
        </span>
      </span>
      {copied ? (
        <Check size={15} className="shrink-0 text-brand-green" />
      ) : (
        <Copy
          size={15}
          className="shrink-0 text-profile-muted opacity-0 transition-opacity group-hover:opacity-100"
        />
      )}
    </button>
  );
}

export default ProfileLinks;