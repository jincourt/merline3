"use client";

import { useEffect } from "react";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  pending = false,
  pendingLabel,
  destructive = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  pendingLabel?: string;
  destructive?: boolean;
}) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, pending]);

  if (!open) return null;

  return (
    <div
      className="dialog-overlay"
      role="presentation"
      onClick={pending ? undefined : onClose}
    >
      <div
        className="dialog-panel confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-medium text-[var(--foreground)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{description}</p>
        ) : null}

        <div className="confirm-dialog-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="btn-ghost btn-form"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={destructive ? "btn-danger btn-form" : "btn-primary btn-form"}
          >
            {pending ? (pendingLabel ?? confirmLabel) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
