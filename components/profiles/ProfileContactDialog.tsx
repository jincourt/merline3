"use client";

import { useEffect, useState } from "react";
import { ProfileContactInfo } from "@/components/profiles/ProfileContactInfo";
import type { VisibleContactInfo } from "@/lib/profile-contact";
import { hasVisibleContactInfo } from "@/lib/profile-contact";

type ProfileContactDialogProps = {
  ownerName: string;
  contact: VisibleContactInfo;
};

export function ProfileContactDialog({
  ownerName,
  contact,
}: ProfileContactDialogProps) {
  const [open, setOpen] = useState(false);
  const visible = hasVisibleContactInfo(contact);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        className="btn-ghost btn-form shrink-0"
        onClick={() => setOpen(true)}
      >
        Contacter
      </button>

      {open ? (
        <div
          className="dialog-overlay"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="dialog-panel profile-contact-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-contact-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="profile-contact-dialog-title"
              className="text-lg font-medium text-[var(--foreground)]"
            >
              Contacter {ownerName}
            </h2>
            <ProfileContactInfo contact={contact} className="profile-contact-info-dialog" />
            <div className="profile-contact-dialog-actions">
              <button
                type="button"
                className="btn-primary btn-form"
                onClick={() => setOpen(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
