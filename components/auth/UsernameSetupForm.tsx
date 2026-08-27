"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import {
  checkUsernameAvailability,
  setupUsername,
} from "@/app/auth/actions";

const initialState = { success: false, message: "" };

export function UsernameSetupForm({
  returnPath = "/",
  defaultUsername = "",
}: {
  returnPath?: string;
  defaultUsername?: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(setupUsername, initialState);
  const [usernameError, setUsernameError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.replace(state.redirectTo);
      router.refresh();
    }
  }, [state.success, state.redirectTo, router]);

  async function handleUsernameBlur(event: React.FocusEvent<HTMLInputElement>) {
    const value = event.target.value.trim();

    if (value.length < 2) {
      setUsernameError("");
      return;
    }

    setCheckingUsername(true);
    const result = await checkUsernameAvailability(value);
    setCheckingUsername(false);
    setUsernameError(result.available ? "" : result.message);
  }

  const submitDisabled = pending || checkingUsername || !!usernameError;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={returnPath} />

      <div>
        <input
          id="username"
          name="username"
          type="text"
          required
          minLength={2}
          maxLength={40}
          autoComplete="username"
          aria-label="Nom d'utilisateur"
          aria-invalid={!!usernameError}
          placeholder="Nom d'utilisateur"
          defaultValue={defaultUsername}
          className="field-input"
          onBlur={handleUsernameBlur}
          onChange={() => {
            if (usernameError) setUsernameError("");
          }}
        />
        {usernameError ? (
          <p className="mt-2 text-sm text-[var(--error)]" role="alert">
            {usernameError}
          </p>
        ) : null}
      </div>

      <div className="signup-terms">
        <input id="accept_terms" name="accept_terms" type="checkbox" required />
        <label htmlFor="accept_terms">
          En t&apos;inscrivant, tu confirmes que tu acceptes les{" "}
          <Link href="/termes-conditions" target="_blank" rel="noopener noreferrer">
            Termes &amp; Conditions de Merline
          </Link>
          , avoir lu la{" "}
          <Link
            href="/politique-confidentialite"
            target="_blank"
            rel="noopener noreferrer"
          >
            Politique de confidentialité
          </Link>
          .
        </label>
      </div>

      {state.message ? (
        <p
          className={`text-sm ${
            state.success ? "text-[var(--success)]" : "text-[var(--error)]"
          }`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn-form btn-form-lg btn-primary w-full"
        disabled={submitDisabled}
      >
        {pending ? "Enregistrement…" : "Continuer"}
      </button>
    </form>
  );
}
