"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  startProfileConversation,
  type ConversationActionResult,
} from "@/app/actions";

const initialState: ConversationActionResult = {
  success: false,
  message: "",
};

type ProfileMessageFormProps = {
  profileId: string;
  isOwner: boolean;
  isLoggedIn: boolean;
  loginHref: string;
  ownerName?: string;
  variant?: "default" | "inline" | "header" | "dialog";
  trailing?: React.ReactNode;
};

function HeaderMessageActions({
  children,
  trailing,
  open = false,
}: {
  children: React.ReactNode;
  trailing?: React.ReactNode;
  open?: boolean;
}) {
  return (
    <div
      className={`profile-message-header-wrap${
        open ? " profile-message-header-wrap-open" : ""
      }`}
    >
      {open ? (
        children
      ) : (
        <div className="profile-message-header-actions">
          {children}
          {trailing}
        </div>
      )}
    </div>
  );
}

export function ProfileMessageForm({
  profileId,
  isOwner,
  isLoggedIn,
  loginHref,
  ownerName,
  variant = "default",
  trailing,
}: ProfileMessageFormProps) {
  const isInline = variant === "inline";
  const isHeader = variant === "header";
  const isDialog = variant === "dialog";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    startProfileConversation,
    initialState,
  );

  useEffect(() => {
    if (state.success && state.convId) {
      router.push(`/dashboard/messages/${state.convId}`);
    }
  }, [state.success, state.convId, router]);

  if (isOwner) {
    if (isHeader || isDialog) {
      return null;
    }

    if (isInline) {
      return (
        <p className="text-xs text-[var(--muted)]">
          C&apos;est votre profil. Les messages arriveront dans votre espace.
        </p>
      );
    }

    return (
      <p className="mt-4 text-xs text-[var(--muted)]">
        C&apos;est votre profil. Les messages arriveront dans votre espace.
      </p>
    );
  }

  const messageForm = (
    <form
      action={action}
      className={`min-w-0 space-y-3${
        isHeader
          ? " profile-message-header-form"
          : isDialog
            ? " profile-contact-dialog-message-form"
            : isInline
              ? " listing-message-inline w-full"
              : " mt-6"
      }`}
    >
      <input type="hidden" name="profile_id" value={profileId} />

      {!isDialog ? (
        <>
          <label htmlFor="profile-message-body" className="field-label">
            Votre message
          </label>
          <textarea
            id="profile-message-body"
            name="body"
            rows={4}
            required
            minLength={1}
            placeholder="Bonjour, je souhaiterais vous contacter…"
            className="field-input min-h-28 resize-y"
          />
        </>
      ) : (
        <>
          <label htmlFor="profile-contact-message-body" className="profile-contact-dialog-field-label">
            Envoyer un message
          </label>
          <div className="messages-conv-compose-field profile-contact-compose-field">
            <textarea
              id="profile-contact-message-body"
              name="body"
              rows={2}
              required
              minLength={1}
              placeholder="Bonjour…"
              className="messages-conv-textarea profile-contact-compose-textarea"
            />
            <div className="messages-conv-compose-actions">
              <button
                type="submit"
                className="messages-conv-send"
                disabled={pending}
                aria-label={pending ? "Envoi en cours" : "Envoyer"}
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              </button>
            </div>
          </div>
        </>
      )}

      {state.message && !state.success ? (
        <p className={isDialog ? "messages-conv-error" : "text-xs text-[var(--error)]"}>
          {state.message}
        </p>
      ) : null}

      {!isDialog ? (
        <div className={`flex gap-2${isHeader ? "" : " gap-3"}`}>
          {isHeader ? (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-form btn-hero flex-1"
              disabled={pending}
            >
              Annuler
            </button>
          ) : null}
          <button type="submit" className="btn-form btn-hero-filled flex-1" disabled={pending}>
            {pending ? "Envoi…" : "Envoyer"}
          </button>
        </div>
      ) : null}
    </form>
  );

  if (isDialog) {
    if (!isLoggedIn) {
      return (
        <>
          <p className="profile-contact-dialog-message-hint">
            Connectez-vous pour écrire à {ownerName ?? "cette personne"}.
          </p>
          <a href={loginHref} className="btn-hero-filled profile-contact-dialog-login">
            Se connecter
          </a>
        </>
      );
    }

    return messageForm;
  }

  if (!isLoggedIn) {
    const loginButton = (
      <a
        href={loginHref}
        className={`btn-form btn-hero-filled public-profile-head-btn inline-flex items-center justify-center text-center${
          isHeader ? " shrink-0 whitespace-nowrap" : isInline ? "" : " mt-6 block w-full"
        }`}
      >
        {isInline || isHeader
          ? "Envoyer un message"
          : "Connectez-vous pour envoyer un message"}
      </a>
    );

    if (isHeader) {
      return (
        <HeaderMessageActions trailing={trailing}>{loginButton}</HeaderMessageActions>
      );
    }

    return loginButton;
  }

  if (!open) {
    const messageButton = (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`btn-form btn-hero-filled public-profile-head-btn${
          isHeader ? " shrink-0 whitespace-nowrap" : isInline ? "" : " mt-6 w-full"
        }`}
      >
        Envoyer un message
      </button>
    );

    if (isHeader) {
      return (
        <HeaderMessageActions trailing={trailing}>{messageButton}</HeaderMessageActions>
      );
    }

    return messageButton;
  }

  if (isHeader) {
    return <HeaderMessageActions open>{messageForm}</HeaderMessageActions>;
  }

  return messageForm;
}
