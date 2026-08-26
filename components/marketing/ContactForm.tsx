"use client";

import { useActionState } from "react";
import { submitContactRequest } from "@/app/actions";

const initialState = { success: false, message: "" };

export function ContactForm({ centered = false }: { centered?: boolean }) {
  const [state, action, pending] = useActionState(
    submitContactRequest,
    initialState,
  );

  return (
    <form
      action={action}
      className={`mt-6 w-full space-y-4 ${centered ? "max-w-md" : "max-w-lg"}`}
    >
      <div>
        <label htmlFor="contact-email" className="field-label">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          placeholder="vous@email.com"
          className="field-input mt-2"
          disabled={pending || state.success}
        />
      </div>

      <div>
        <label htmlFor="contact-phone" className="field-label">
          Numéro de téléphone
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            required
            placeholder="06 12 34 56 78"
            className="field-input flex-1"
            disabled={pending || state.success}
          />
          <button
            type="submit"
            className="btn-primary shrink-0"
            disabled={pending || state.success}
          >
            {pending ? "Envoi…" : state.success ? "Envoyé" : "Envoyer"}
          </button>
        </div>
      </div>

      {state.message ? (
        <p
          className={`text-sm ${centered ? "text-center" : ""} ${
            state.success ? "text-[var(--success)]" : "text-[var(--error)]"
          }`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
