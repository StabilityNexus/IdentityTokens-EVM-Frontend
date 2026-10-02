"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, Share2 } from "lucide-react";
import { CopyLinkButton } from "@/components/share/CopyLinkButton";
import { SocialShareRow } from "@/components/share/SocialShareRow";
import { Modal } from "@/components/ui/Modal";
import { renderClaimCardImage } from "@/lib/cardImage";
import { getEtherscanTxUrl } from "@/lib/errors";
import { CLAIM_URL, buildClaimShare, getWalletUrl } from "@/lib/share";
import { ShareCardModalProps } from "@/lib/types";

interface RenderedImage {
  key: string;
  blob: Blob;
  url: string;
}

type Notice =
  | { kind: "copied"; target: string }
  | { kind: "copy-failed"; target: string }
  | null;

const SECONDARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-utsaha text-sm text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";

/** After a reservation: the card image and prefilled posts to share it. */
export function ShareCardModal({
  isOpen,
  onClose,
  username,
  walletAddress,
  dateLabel,
  txHash,
}: ShareCardModalProps) {
  const titleId = useId();
  const [rendered, setRendered] = useState<RenderedImage | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  // Posts link to the wallet page (or /claim without one); the image to /claim.
  const claimUrl = CLAIM_URL;
  const shareUrl = walletAddress ? getWalletUrl(walletAddress) : CLAIM_URL;
  const shareContent = useMemo(
    () => buildClaimShare(username, shareUrl),
    [username, shareUrl]
  );
  const imageKey = `${username}|${walletAddress ?? ""}|${dateLabel}`;
  const image = rendered?.key === imageKey ? rendered : null;
  const imageFailed = failedKey === imageKey;
  const needsRender = isOpen && !image && !imageFailed;

  useEffect(() => {
    if (!needsRender) return;
    let cancelled = false;

    renderClaimCardImage({ username, walletAddress, dateLabel, claimUrl })
      .then((blob) => {
        if (cancelled) return;
        setRendered({ key: imageKey, blob, url: URL.createObjectURL(blob) });
      })
      .catch((error: unknown) => {
        console.error("Could not render the share card:", error);
        if (!cancelled) setFailedKey(imageKey);
      });

    return () => {
      cancelled = true;
    };
  }, [needsRender, imageKey, username, walletAddress, dateLabel, claimUrl]);

  // Each object URL is released once a newer image replaces it, or on unmount.
  const imageUrl = rendered?.url;
  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 7000);
    return () => clearTimeout(timer);
  }, [notice]);

  const fileName = `dit-${username}.png`;
  const shareFile = useMemo(
    () =>
      image ? new File([image.blob], fileName, { type: "image/png" }) : null,
    [image, fileName]
  );
  const canShareFile =
    !!shareFile &&
    typeof navigator !== "undefined" &&
    !!navigator.canShare?.({ files: [shareFile] });

  // Has to start inside the click, while the page still has focus.
  const copyImageFor = (target: string) => {
    if (
      !image ||
      !navigator.clipboard?.write ||
      typeof ClipboardItem === "undefined"
    ) {
      setNotice({ kind: "copy-failed", target });
      return;
    }
    navigator.clipboard
      .write([new ClipboardItem({ [image.blob.type]: image.blob })])
      .then(
        () => setNotice({ kind: "copied", target }),
        () => setNotice({ kind: "copy-failed", target })
      );
  };

  const shareNatively = () => {
    if (!shareFile) return;
    navigator
      .share({
        files: [shareFile],
        text: `${shareContent.short}\n${shareUrl}`,
      })
      .catch(() => {
        // Dismissing the share sheet rejects too; there is nothing to report.
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId={titleId}
      title={<>@{username} is yours</>}
      subtitle="Your root identity is live on Sepolia. Share your card and get your friends to claim theirs."
      widthClassName="max-w-xl max-h-[calc(100dvh-2rem)] overflow-y-auto no-scrollbar"
    >
      {/* Preview of exactly what gets shared. */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-dark-bg">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- a blob URL, not a static asset
          <img
            src={image.url}
            alt={`dit ID card for @${username}`}
            className="h-full w-full object-cover"
          />
        ) : imageFailed ? (
          <div className="flex h-full items-center justify-center px-6 text-center font-utsaha text-sm text-gray-400">
            Couldn&rsquo;t draw your card image. You can still share the link
            below.
          </div>
        ) : (
          <div className="flex h-full animate-pulse items-center justify-center font-utsaha text-sm text-gray-500">
            Printing your card…
          </div>
        )}
      </div>

      <h3 className="mt-6 font-utsaha text-sm text-gray-300">Share on</h3>
      {/* Composers can't take an image by URL, so the card is copied to paste. */}
      <div className="mt-3">
        <SocialShareRow content={shareContent} onSelect={copyImageFor} />
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-3 min-h-10 font-utsaha text-xs leading-relaxed text-gray-400"
      >
        {notice?.kind === "copied" && (
          <span className="text-brand-green">
            Card image copied. Paste it into your {notice.target} post with
            Ctrl+V or ⌘V, then hit post.
          </span>
        )}
        {notice?.kind === "copy-failed" && (
          <span className="text-text-warning">
            Couldn&rsquo;t copy the image here. Download it below and attach it
            to your {notice.target} post.
          </span>
        )}
        {!notice &&
          "Your post opens ready to go, and the card image is copied so you can paste it straight in."}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {image ? (
          <a href={image.url} download={fileName} className={SECONDARY_BUTTON}>
            <Download size={16} aria-hidden="true" />
            Download image
          </a>
        ) : (
          <button type="button" disabled className={SECONDARY_BUTTON}>
            <Download size={16} aria-hidden="true" />
            Download image
          </button>
        )}
        <CopyLinkButton url={shareUrl} />
        {canShareFile && (
          <button
            type="button"
            onClick={shareNatively}
            className={SECONDARY_BUTTON}
          >
            <Share2 size={16} aria-hidden="true" />
            More options
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-5 font-utsaha text-sm">
        {txHash ? (
          <a
            href={getEtherscanTxUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-blue-link underline underline-offset-2 hover:opacity-80"
          >
            View transaction ↗
          </a>
        ) : (
          <span />
        )}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-white transition-opacity hover:opacity-80"
        >
          Go to your dashboard
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </Modal>
  );
}

export default ShareCardModal;
