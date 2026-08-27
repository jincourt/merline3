"use client";

import { useEffect } from "react";
import { AuthForm } from "./AuthForm";

export function AuthDialog({
  open,
  onClose,
  onSuccess,
  returnPath = "/dashboard",
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  returnPath?: string;
}) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dialog-overlay" role="presentation" onClick={onClose}>
      <div
        className="dialog-panel page-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <h2 id="auth-dialog-title" className="text-lg font-medium">
              Se connecter à Merline
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Un code sera envoyé à votre email. Votre brouillon est conservé.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="mt-5">
          <AuthForm inline onSuccess={onSuccess} returnPath={returnPath} />
        </div>
      </div>
    </div>
  );
}
