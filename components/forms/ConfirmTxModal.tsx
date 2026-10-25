"use client";

import React, { useId, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { DonationCheckbox } from "@/components/ui/DonationCheckbox";

interface ConfirmTxModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  /** Red for revoke, yellow for flag, matching their inline buttons */
  tone: "red" | "yellow";
  /** Sends the transaction; its progress shows where the action was started */
  onConfirm: (donate: boolean) => void;
  onClose: () => void;
}

/** A confirm step for one-click actions, so they can carry the donation box. */
export function ConfirmTxModal({
  title,
  description,
  confirmLabel,
  tone,
  onConfirm,
  onClose,
}: ConfirmTxModalProps) {
  const [donate, setDonate] = useState(true);
  const titleId = useId();

  return (
    <Modal isOpen onClose={onClose} titleId={titleId} title={title}>
      <div className="flex flex-col gap-5">
        <p className="font-utsaha text-sm text-gray-400">{description}</p>

        <DonationCheckbox checked={donate} onChange={setDonate} />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-modal-inner-bg py-2.5 font-utsaha text-gray-300 transition-colors hover:bg-modal-border hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(donate);
              onClose();
            }}
            className={`flex-1 rounded-lg py-2.5 font-utsaha text-black transition-all hover:opacity-90 active:scale-[0.98] ${
              tone === "yellow" ? "bg-yellow-400" : ""
            }`}
            style={
              tone === "red"
                ? { backgroundColor: "var(--color-text-red)" }
                : undefined
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
