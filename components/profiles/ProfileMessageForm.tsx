"use client";

import { useActionState, useEffect, useState } from "react";
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
  variant?: "default" | "inline" | "header";
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
  variant = "default",
  trailing,
}: ProfileMessageFormProps) {
  const isInline = variant === "inline";
  const isHeader = variant === "header";
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
    if (isHeader) {
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

  if (!isLoggedIn) {
    const loginButton = (
      <a
        href={loginHref}
        className={`btn-form btn-primary text-center${
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
        className={`btn-form btn-primary${
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

  const messageForm = (
    <form
      action={action}
      className={`min-w-0 space-y-3${
        isHeader
          ? " profile-message-header-form"
          : isInline
            ? " listing-message-inline w-full"
            : " mt-6"
      }`}
    >
      <input type="hidden" name="profile_id" value={profileId} />

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

      {state.message && !state.success ? (
        <p className="text-xs text-[var(--error)]">{state.message}</p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-form btn-ghost flex-1"
          disabled={pending}
        >
          Annuler
        </button>
        <button type="submit" className="btn-form btn-primary flex-1" disabled={pending}>
          {pending ? "Envoi…" : "Envoyer"}
        </button>
      </div>
    </form>
  );

  if (isHeader) {
    return <HeaderMessageActions open>{messageForm}</HeaderMessageActions>;
  }

  return messageForm;
}
