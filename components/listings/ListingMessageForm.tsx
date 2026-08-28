"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { startConversation, type ConversationActionResult } from "@/app/actions";
import type { ListingSource } from "@/lib/types";

const initialState: ConversationActionResult = {
  success: false,
  message: "",
};

type ListingMessageFormProps = {
  listingId: string;
  src: ListingSource;
  isOwner: boolean;
  isLoggedIn: boolean;
  loginHref: string;
  variant?: "default" | "inline";
  leading?: React.ReactNode;
};

export function ListingMessageForm({
  listingId,
  src,
  isOwner,
  isLoggedIn,
  loginHref,
  variant = "default",
  leading,
}: ListingMessageFormProps) {
  const isInline = variant === "inline";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(startConversation, initialState);

  useEffect(() => {
    if (state.success && state.convId) {
      router.push(`/dashboard/messages/${state.convId}`);
    }
  }, [state.success, state.convId, router]);

  if (isOwner) {
    if (isInline) {
      return (
        <div className="mt-5 min-w-0">
          {leading ? (
            <div className="flex flex-wrap items-center gap-3">{leading}</div>
          ) : null}
          <p className="mt-3 text-xs text-[var(--muted)]">
            C&apos;est votre annonce. Les messages arriveront dans votre espace.
          </p>
        </div>
      );
    }

    return (
      <p className="mt-4 text-xs text-[var(--muted)]">
        C&apos;est votre annonce. Les messages arriveront dans votre espace.
      </p>
    );
  }

  if (!isLoggedIn) {
    const loginButton = (
      <a
        href={loginHref}
        className={`btn-form btn-primary text-center${isInline ? "" : " mt-6 block w-full"}`}
      >
        {isInline ? "Envoyer un message" : "Connectez-vous pour envoyer un message"}
      </a>
    );

    if (isInline) {
      return (
        <div className="mt-5 flex min-w-0 flex-wrap items-center gap-3">
          {loginButton}
          {leading}
        </div>
      );
    }

    return loginButton;
  }

  if (!open) {
    const messageButton = (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`btn-form btn-primary${isInline ? "" : " mt-6 w-full"}`}
      >
        Envoyer un message
      </button>
    );

    if (isInline) {
      return (
        <div className="mt-5 flex min-w-0 flex-wrap items-center gap-3">
          {messageButton}
          {leading}
        </div>
      );
    }

    return messageButton;
  }

  return (
    <form
      action={action}
      className={`min-w-0 space-y-3${isInline ? " mt-5 w-full" : " mt-6"}`}
    >
      <input type="hidden" name="listing_id" value={listingId} />
      <input type="hidden" name="src" value={src} />

      <label htmlFor="message-body" className="field-label">
        Votre message
      </label>
      <textarea
        id="message-body"
        name="body"
        rows={4}
        required
        minLength={1}
        placeholder="Bonjour, votre annonce m'intéresse…"
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
}
