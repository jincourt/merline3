"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProfileContactInfo } from "@/components/profiles/ProfileContactInfo";
import { ProfileMessageForm } from "@/components/profiles/ProfileMessageForm";
import type { VisibleContactInfo } from "@/lib/profile-contact";
import { hasVisibleContactInfo } from "@/lib/profile-contact";

type ProfileContactDialogProps = {
  ownerName: string;
  contact: VisibleContactInfo;
  profileId?: string;
  isLoggedIn?: boolean;
  loginHref?: string;
  showMessageForm?: boolean;
  filledTrigger?: boolean;
};

export function ProfileContactDialog({
  ownerName,
  contact,
  profileId,
  isLoggedIn = false,
  loginHref = "/login",
  showMessageForm = false,
  filledTrigger = false,
}: ProfileContactDialogProps) {
  const [open, setOpen] = useState(false);
  const visibleContact = hasVisibleContactInfo(contact);
  const canOpen = visibleContact || showMessageForm;

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

  if (!canOpen) return null;

  return (
    <>
      <button
        type="button"
        className={
          filledTrigger
            ? "header-user-menu-trigger public-profile-contact-btn"
            : "btn-form btn-hero shrink-0"
        }
        onClick={() => setOpen(true)}
      >
        Contact
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="dialog-overlay profile-contact-dialog-overlay"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="profile-contact-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-contact-dialog-title"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="profile-contact-dialog-title" className="profile-contact-dialog-title">
                {ownerName}
              </h2>

              {visibleContact ? (
                <ProfileContactInfo contact={contact} className="profile-contact-info-dialog" />
              ) : null}

              {showMessageForm && profileId ? (
                <div
                  className={`profile-contact-dialog-message${
                    visibleContact ? "" : " profile-contact-dialog-message-first"
                  }`}
                >
                  <ProfileMessageForm
                    profileId={profileId}
                    isOwner={false}
                    isLoggedIn={isLoggedIn}
                    loginHref={loginHref}
                    ownerName={ownerName}
                    variant="dialog"
                  />
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
