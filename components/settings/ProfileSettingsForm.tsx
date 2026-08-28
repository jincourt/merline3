"use client";

import { useActionState, useState } from "react";
import { checkUsernameAvailability } from "@/app/auth/actions";
import { updateProfile, type ActionResult } from "@/app/actions";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { SWISS_CANTONS } from "@/lib/swiss-cantons";
import type { UserProfile } from "@/lib/profile";
import {
  PROFILE_TYPE_LABELS,
  PROFILE_TYPES,
  type ProfileType,
} from "@/lib/profile-type";

const initialState: ActionResult = { success: false, message: "" };

const cantonOptions = [
  { value: "", label: "Sélectionner un canton" },
  ...SWISS_CANTONS.map((canton) => ({
    value: canton.code,
    label: `${canton.code} — ${canton.label}`,
  })),
];

const profileTypeOptions = PROFILE_TYPES.map((type) => ({
  value: type,
  label: PROFILE_TYPE_LABELS[type],
}));

type ProfileSettingsFormProps = {
  profile: UserProfile;
};

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const [state, action, pending] = useActionState(updateProfile, initialState);
  const [usernameError, setUsernameError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [canton, setCanton] = useState(profile.canton);
  const [profileType, setProfileType] = useState<ProfileType>(
    profile.profileType ?? "annonceur",
  );

  async function handleUsernameBlur(event: React.FocusEvent<HTMLInputElement>) {
    const value = event.target.value.trim();
    const initial = profile.username.trim();

    if (value.length < 2 || value.toLowerCase() === initial.toLowerCase()) {
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
    <form action={action} className="dashboard-settings-form">
      <div className="dashboard-settings-grid">
        <div className="dashboard-settings-card">
          <div className="dashboard-settings-col">
            <SelectDropdown
              id="profile-type"
              label="Type de profil"
              labelSpacing="md"
              value={profileType}
              onChange={setProfileType}
              options={profileTypeOptions}
              placeholder="Choisir un type"
            />
            <input type="hidden" name="profile_type" value={profileType} />

            <div>
              <label htmlFor="profile-name" className="field-label">
                Votre nom
              </label>
              <input
                id="profile-name"
                name="name"
                type="text"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                defaultValue={profile.name}
                className="field-input mt-2"
              />
            </div>

            <div>
              <label htmlFor="profile-username" className="field-label">
                Nom d&apos;utilisateur
              </label>
              <input
                id="profile-username"
                name="username"
                type="text"
                required
                minLength={2}
                maxLength={40}
                autoComplete="username"
                defaultValue={profile.username}
                className="field-input mt-2"
                aria-invalid={!!usernameError}
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

            <div>
              <label htmlFor="profile-phone" className="field-label">
                Numéro de téléphone
              </label>
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+41 79 000 00 00"
                defaultValue={profile.phone}
                className="field-input mt-2"
              />
            </div>

            <div>
              <label htmlFor="profile-website" className="field-label">
                Site internet
              </label>
              <input
                id="profile-website"
                name="website"
                type="url"
                autoComplete="url"
                placeholder="https://example.ch"
                defaultValue={profile.website}
                className="field-input mt-2"
              />
            </div>
          </div>
        </div>

        <div className="dashboard-settings-card">
          <div className="dashboard-settings-col">
            <div>
              <label htmlFor="profile-address" className="field-label">
                Adresse
              </label>
              <input
                id="profile-address"
                name="address"
                type="text"
                autoComplete="street-address"
                placeholder="Rue et numéro"
                defaultValue={profile.address}
                className="field-input mt-2"
              />
            </div>

            <div>
              <label htmlFor="profile-npa" className="field-label">
                NPA
              </label>
              <input
                id="profile-npa"
                name="npa"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="1000"
                maxLength={4}
                defaultValue={profile.npa}
                className="field-input mt-2"
              />
            </div>

            <div>
              <SelectDropdown
                id="profile-canton"
                label="Canton"
                labelSpacing="md"
                value={canton}
                onChange={setCanton}
                options={cantonOptions}
                placeholder="Sélectionner un canton"
              />
              <input type="hidden" name="canton" value={canton} />
            </div>
          </div>
        </div>
      </div>

      {state.message ? (
        <p
          className={`dashboard-settings-feedback ${
            state.success ? "text-[var(--success)]" : "text-[var(--error)]"
          }`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <div className="dashboard-settings-footer">
        <button
          type="submit"
          className="btn-form btn-primary dashboard-settings-save"
          disabled={submitDisabled}
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
