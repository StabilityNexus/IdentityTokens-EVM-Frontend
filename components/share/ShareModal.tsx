"use client";

import React, { useId } from "react";
import { Modal } from "@/components/ui/Modal";
import { ShareContent } from "@/lib/share";
import { CopyLinkButton } from "./CopyLinkButton";
import { SocialShareRow } from "./SocialShareRow";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ShareContent;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}

/** Share a link: a row of networks with prefilled posts, and the link itself. */
export function ShareModal({
  isOpen,
  onClose,
  content,
  title = "Share",
  subtitle,
}: ShareModalProps) {
  const titleId = useId();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId={titleId}
      title={title}
      subtitle={subtitle}
      widthClassName="max-w-xl"
    >
      <h3 className="font-utsaha text-sm text-gray-300">Share on</h3>
      <div className="mt-3">
        <SocialShareRow content={content} />
      </div>

      <h3 className="mt-6 font-utsaha text-sm text-gray-300">Or copy link</h3>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-modal-inner-bg p-1.5 pl-4">
        {/* Not an input: a focused input scrolls the link to its tail. */}
        <p
          title={content.url}
          className="min-w-0 flex-1 truncate font-utsaha text-sm text-gray-300"
        >
          {content.url.replace(/^https?:\/\//, "")}
        </p>
        <CopyLinkButton url={content.url} className="shrink-0 py-2" />
      </div>
    </Modal>
  );
}

export default ShareModal;
