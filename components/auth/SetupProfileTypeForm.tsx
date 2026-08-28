"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { setupProfileType, type AuthResult } from "@/app/auth/actions";
import {
  PROFILE_TYPE_LABELS,
  type ProfileType,
} from "@/lib/profile-type";

const initialState: AuthResult = { success: false, message: "" };

type SetupProfileTypeFormProps = {
  returnPath: string;
};

export function SetupProfileTypeForm({ returnPath }: SetupProfileTypeFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(setupProfileType, initialState);
  const [selectedType, setSelectedType] = useState<ProfileType | "">("");

  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.replace(state.redirectTo);
    }
  }, [state.success, state.redirectTo, router]);

  const submitDisabled = pending || !selectedType;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-medium tracking-tight md:text-2xl">
          Choisissez votre profil
        </h2>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          Étape 2 sur 3
        </p>
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={returnPath} />
        <input type="hidden" name="profile_type" value={selectedType} />

        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Comment souhaitez-vous utiliser Merline ?
        </p>

        <div className="profile-type-grid">
          {(["annonceur", "agent"] as const).map((type) => {
            const selected = selectedType === type;

            return (
              <button
                key={type}
                type="button"
                className={`profile-type-card${selected ? " profile-type-card-selected" : ""}`}
                aria-pressed={selected}
                onClick={() => setSelectedType(type)}
              >
                <span className="profile-type-card-title">
                  {PROFILE_TYPE_LABELS[type]}
                </span>
                <span className="profile-type-card-desc">
                  {type === "annonceur"
                    ? "Je publie des annonces et je cherche des agents."
                    : "Je mets mes contacts en relation avec les annonceurs."}
                </span>
              </button>
            );
          })}
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
          {pending ? "Enregistrement…" : "Terminer"}
        </button>
      </form>
    </div>
  );
}
