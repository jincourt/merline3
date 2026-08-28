"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Mail } from "lucide-react";
import {
  sendEmailCode,
  verifyEmailCode,
  signInWithGoogle,
} from "@/app/auth/actions";

const initialState = { success: false, message: "" };

export function AuthForm({
  inline = false,
  onSuccess,
  returnPath = "/",
}: {
  inline?: boolean;
  onSuccess?: () => void;
  returnPath?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailOpen, setEmailOpen] = useState(inline);
  const [codeSent, setCodeSent] = useState(false);
  const [sendState, sendAction, sendPending] = useActionState(
    sendEmailCode,
    initialState,
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyEmailCode,
    initialState,
  );

  useEffect(() => {
    if (sendState.success) {
      setCodeSent(true);
    }
  }, [sendState.success]);

  useEffect(() => {
    if (inline && verifyState.success && verifyState.message === "Connecté.") {
      router.refresh();
      onSuccess?.();
    }
  }, [inline, verifyState.success, verifyState.message, router, onSuccess]);

  return (
    <div className="space-y-4">
      {!emailOpen && !codeSent ? (
        <>
          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value={returnPath} />
            <button type="submit" className="btn-form btn-ghost w-full gap-2">
              <Globe className="h-4 w-4" aria-hidden />
              Continuer avec Google
            </button>
          </form>

          <button
            type="button"
            className="btn-form btn-ghost w-full gap-2"
            onClick={() => setEmailOpen(true)}
          >
            <Mail className="h-4 w-4" aria-hidden />
            Continuer avec un email
          </button>
        </>
      ) : !codeSent ? (
        <form action={sendAction} className="space-y-4">
          {!inline ? (
            <button
              type="button"
              onClick={() => {
                setEmailOpen(false);
                setEmail("");
              }}
              className="btn-link-back"
            >
              Retour
            </button>
          ) : null}

          <div>
            <input
              id={inline ? "dialog-email" : "email"}
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              aria-label="Email"
              className="field-input"
              autoFocus={!inline}
            />
          </div>

          {sendState.message ? (
            <p
              className={`text-sm ${
                sendState.success ? "text-[var(--success)]" : "text-[var(--error)]"
              }`}
              role="status"
            >
              {sendState.message}
            </p>
          ) : null}

          <button
            type="submit"
            className="btn-form btn-form-lg btn-primary w-full"
            disabled={sendPending}
          >
            {sendPending ? "Envoi…" : "Recevoir un code"}
          </button>
        </form>
      ) : (
        <form action={verifyAction} className="space-y-4">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={returnPath} />
          {inline ? <input type="hidden" name="inline" value="true" /> : null}

          <p className="text-sm text-[var(--muted)]">
            Code envoyé à <span className="text-[var(--foreground)]">{email}</span>
          </p>

          <div>
            <label htmlFor={inline ? "dialog-code" : "code"} className="field-label">
              Code
            </label>
            <input
              id={inline ? "dialog-code" : "code"}
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              placeholder="123456"
              className="field-input mt-2 tracking-[0.3em]"
            />
          </div>

          {verifyState.message && !(inline && verifyState.success) ? (
            <p
              className={`text-sm ${
                verifyState.success ? "text-[var(--success)]" : "text-[var(--error)]"
              }`}
              role="status"
            >
              {verifyState.message}
            </p>
          ) : null}

          <button
            type="submit"
            className="btn-form btn-form-lg btn-primary w-full"
            disabled={verifyPending}
          >
            {verifyPending ? "Vérification…" : "Continuer"}
          </button>

          <button
            type="button"
            onClick={() => {
              setCodeSent(false);
              setEmailOpen(true);
            }}
            className="btn-link w-full text-center text-xs text-[var(--muted)]"
          >
            Changer d&apos;email
          </button>
        </form>
      )}
    </div>
  );
}
