"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { ADS_GENERATION_PROMPT } from "@/lib/admin-ads";

export function AdPromptDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (!open) return null;

  async function copyPrompt() {
    await navigator.clipboard.writeText(ADS_GENERATION_PROMPT);
    setCopied(true);
  }

  return (
    <div className="dialog-overlay" role="presentation" onClick={onClose}>
      <div
        className="dialog-panel admin-prompt-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ad-prompt-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="ad-prompt-title">Prompt de régénération</h2>
        <p className="admin-prompt-lead">
          Collez ce texte dans un nouveau chat pour recréer des publicités dans
          le même système (design, formats, Remotion, sauvegarde).
        </p>
        <textarea
          className="admin-prompt-text"
          readOnly
          value={ADS_GENERATION_PROMPT}
        />
        <div className="admin-prompt-actions">
          <button type="button" className="admin-btn-ghost" onClick={onClose}>
            Fermer
          </button>
          <button type="button" className="admin-btn admin-btn-inline" onClick={copyPrompt}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copié" : "Copier le prompt"}
          </button>
        </div>
      </div>
    </div>
  );
}
