"use client";

import React from "react";
import type { IconType } from "react-icons";
import {
  FaBluesky,
  FaLinkedinIn,
  FaRedditAlien,
  FaTelegram,
  FaThreads,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";
import { SiFarcaster } from "react-icons/si";
import { ShareContent } from "@/lib/share";

interface ShareTarget {
  id: string;
  label: string;
  icon: IconType;
  href: (content: ShareContent) => string;
}

const enc = encodeURIComponent;

/** Short copy with the link on its own line, for composers without a url field. */
const shortWithLink = ({ short, url }: ShareContent) => `${short}\n${url}`;

// Each opens that network's own composer with the post already written.
const SHARE_TARGETS: ShareTarget[] = [
  {
    id: "x",
    label: "X",
    icon: FaXTwitter,
    href: (c) =>
      `https://x.com/intent/post?text=${enc(c.short)}&url=${enc(c.url)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: FaLinkedinIn,
    href: (c) =>
      `https://www.linkedin.com/feed/?shareActive=true&text=${enc(c.long)}`,
  },
  {
    id: "farcaster",
    label: "Farcaster",
    icon: SiFarcaster,
    href: (c) =>
      `https://farcaster.xyz/~/compose?text=${enc(c.short)}&embeds[]=${enc(c.url)}`,
  },
  {
    id: "bluesky",
    label: "Bluesky",
    icon: FaBluesky,
    href: (c) =>
      `https://bsky.app/intent/compose?text=${enc(shortWithLink(c))}`,
  },
  {
    id: "threads",
    label: "Threads",
    icon: FaThreads,
    href: (c) =>
      `https://www.threads.net/intent/post?text=${enc(shortWithLink(c))}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: FaTelegram,
    href: (c) =>
      `https://t.me/share/url?url=${enc(c.url)}&text=${enc(c.short)}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: FaWhatsapp,
    href: (c) => `https://wa.me/?text=${enc(shortWithLink(c))}`,
  },
  {
    id: "reddit",
    label: "Reddit",
    icon: FaRedditAlien,
    href: (c) =>
      `https://www.reddit.com/submit?url=${enc(c.url)}&title=${enc(c.title)}`,
  },
];

interface SocialShareRowProps {
  content: ShareContent;
  /** Runs inside the click, while the page can still write to the clipboard. */
  onSelect?: (label: string) => void;
}

/** A horizontal row of networks, each opening a prefilled post. */
export function SocialShareRow({ content, onSelect }: SocialShareRowProps) {
  return (
    <ul className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:justify-between md:-mx-8 md:px-8">
      {SHARE_TARGETS.map((target) => {
        const Icon = target.icon;
        return (
          <li key={target.id} className="shrink-0">
            <a
              href={target.href(content)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onSelect?.(target.label)}
              className="group flex w-14 flex-col items-center gap-2 font-utsaha text-xs text-gray-400 transition-colors hover:text-white"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all group-hover:scale-105 group-hover:border-white/25 group-hover:bg-white/10">
                <Icon size={20} aria-hidden="true" />
              </span>
              {target.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default SocialShareRow;
