"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { setupAgentDescription, type AuthResult } from "@/app/auth/actions";

const initialState: AuthResult = { success: false, message: "" };

type SetupAgentDescriptionFormProps = {
  returnPath: string;
  initialDescription?: string;
};

export function SetupAgentDescriptionForm({
  returnPath,
  initialDescription = "",
}: SetupAgentDescriptionFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(setupAgentDescription, initialState);

  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.replace(state.redirectTo);
    }
  }, [state.success, state.redirectTo, router]);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-medium tracking-tight md:text-2xl">
          Présentez-vous
        </h2>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          Étape 3 sur 3
        </p>
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={returnPath} />

        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Décrivez votre expérience et votre réseau pour rassurer les annonceurs.
        </p>

        <div>
          <label htmlFor="agent-description" className="field-label">
            Description
          </label>
          <textarea
            id="agent-description"
            name="description"
            rows={6}
            maxLength={2000}
            defaultValue={initialDescription}
            placeholder="Ex. Agent immobilier à Genève, spécialisé dans les biens de standing…"
            className="field-input mt-2 min-h-[9rem] resize-y"
          />
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
          disabled={pending}
        >
          {pending ? "Enregistrement…" : "Terminer"}
        </button>
      </form>
    </div>
  );
}
