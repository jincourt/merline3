"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { checkUsernameAvailability } from "@/app/auth/actions";
import { updateProfile, type ActionResult } from "@/app/actions";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { ProfileLogoUpload } from "@/components/settings/ProfileLogoUpload";
import { SettingsContactRow } from "@/components/settings/ContactDisplayToggle";
import { SWISS_CANTONS } from "@/lib/swiss-cantons";
import type { UserProfile } from "@/lib/profile";
import type { BankAccount } from "@/lib/profile-bank";
import { hasBankAccount } from "@/lib/profile-bank";
import {
  isValidProfileType,
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
  bankAccount: BankAccount;
  userId: string;
  authEmail: string;
};

export function ProfileSettingsForm({
  profile,
  bankAccount,
  userId,
  authEmail,
}: ProfileSettingsFormProps) {
  const [state, action, pending] = useActionState(updateProfile, initialState);
  const [usernameError, setUsernameError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [canton, setCanton] = useState(profile.canton);
  const [profileType, setProfileType] = useState<ProfileType>(
    profile.profileType ?? "annonceur",
  );
  const [bankOpen, setBankOpen] = useState(hasBankAccount(bankAccount));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (profileType !== "agent" && textareaRef.current) {
      textareaRef.current.value = profile.description;
    }
  }, [profileType, profile.description]);

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
  const displayEmail = authEmail.trim() || profile.contactEmail.trim();

  return (
    <form action={action} className="form-stripe settings-form">
      <div className="form-stripe-section">
        <p className="settings-section-title">Profil</p>

        <div className="form-stripe-field">
          <SelectDropdown
            id="profile-type"
            label="Type de profil"
            value={profileType}
            onChange={(value) => {
              if (isValidProfileType(value)) setProfileType(value);
            }}
            options={profileTypeOptions}
            placeholder="Choisir un type"
            className="form-stripe-select"
          />
          <input type="hidden" name="profile_type" value={profileType} />
        </div>

        <ProfileLogoUpload
          userId={userId}
          displayName={profile.name}
          username={profile.username}
          initialUrl={profile.avatarUrl}
        />

        <div className="form-stripe-row">
          <div className="form-stripe-field">
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
              className="field-input"
            />
          </div>

          <div className="form-stripe-field">
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
              className="field-input"
              aria-invalid={!!usernameError}
              onBlur={handleUsernameBlur}
              onChange={() => {
                if (usernameError) setUsernameError("");
              }}
            />
            {usernameError ? (
              <p className="text-sm text-[var(--error)]" role="alert">
                {usernameError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="form-stripe-field">
          <label
            htmlFor={
              profileType === "agent"
                ? "profile-description"
                : "profile-description-annonceur"
            }
            className="field-label"
          >
            Description
            {profileType !== "agent" ? (
              <span className="ml-1 font-normal normal-case tracking-normal text-[var(--muted-dim)]">
                (optionnel)
              </span>
            ) : null}
          </label>
          <textarea
            ref={textareaRef}
            id={
              profileType === "agent"
                ? "profile-description"
                : "profile-description-annonceur"
            }
            name="description"
            rows={profileType === "agent" ? 5 : 4}
            maxLength={2000}
            defaultValue={profile.description}
            placeholder={
              profileType === "agent"
                ? "Présentez votre expérience et votre réseau…"
                : "Présentez-vous brièvement aux agents intéressés…"
            }
            className="field-input min-h-[6.5rem] resize-y"
          />
        </div>
      </div>

      <div className="form-stripe-section">
        <p className="settings-section-title">Contact</p>

        <SettingsContactRow
          id="profile-email"
          label="Email"
          name="contact_email_display"
          type="email"
          defaultValue={displayEmail}
          readOnly
          showName="show_email"
          defaultShown={profile.showEmail}
          showDisabled={!displayEmail}
          showVisibilityLabel
        />

        <SettingsContactRow
          id="profile-phone"
          label="Numéro de téléphone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+41 79 000 00 00"
          defaultValue={profile.phone}
          showName="show_phone"
          defaultShown={profile.showPhone}
          showDisabled={!profile.phone.trim()}
        />

        <SettingsContactRow
          id="profile-website"
          label="Site internet"
          name="website"
          type="url"
          autoComplete="url"
          placeholder="https://example.ch"
          defaultValue={profile.website}
          showName="show_website"
          defaultShown={profile.showWebsite}
          showDisabled={!profile.website.trim()}
        />
      </div>

      <div className="form-stripe-section">
        <p className="settings-section-title">Adresse</p>

        <SettingsContactRow
          id="profile-address"
          label="Adresse"
          name="address"
          type="text"
          autoComplete="street-address"
          placeholder="Rue et numéro"
          defaultValue={profile.address}
          showName="show_address"
          defaultShown={profile.showAddress}
          showDisabled={!profile.address.trim()}
          showVisibilityLabel
        />

        <div className="form-stripe-row">
          <div className="form-stripe-field">
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
              className="field-input"
            />
          </div>

          <div className="form-stripe-field">
            <SelectDropdown
              id="profile-canton"
              label="Canton"
              value={canton}
              onChange={setCanton}
              options={cantonOptions}
              placeholder="Sélectionner un canton"
              className="form-stripe-select"
            />
            <input type="hidden" name="canton" value={canton} />
          </div>
        </div>
      </div>

      <div className="form-stripe-section settings-bank-section">
        <button
          type="button"
          className="settings-bank-trigger"
          aria-expanded={bankOpen}
          aria-controls="bank-account-panel"
          onClick={() => setBankOpen((value) => !value)}
        >
          <span className="settings-bank-trigger-copy">
            <span className="settings-section-title settings-bank-trigger-title">
              Paiement
            </span>
            <span className="settings-bank-trigger-desc">
              {hasBankAccount(bankAccount)
                ? "Compte bancaire enregistré"
                : "Ajouter un compte pour recevoir vos commissions"}
            </span>
          </span>
          <ChevronDown
            className={`settings-bank-trigger-chevron ${bankOpen ? "settings-bank-trigger-chevron-open" : ""}`}
            strokeWidth={1.75}
            aria-hidden
          />
        </button>

        <div
          id="bank-account-panel"
          className={`settings-bank-panel ${bankOpen ? "settings-bank-panel-open" : ""}`}
          aria-hidden={!bankOpen}
          inert={!bankOpen ? true : undefined}
        >
          <div className="settings-bank-panel-inner">
            <div className="form-stripe-field">
              <label htmlFor="bank-account-name" className="field-label">
                Nom du compte
              </label>
              <input
                id="bank-account-name"
                name="bank_account_name"
                type="text"
                autoComplete="name"
                defaultValue={bankAccount.accountName}
                className="field-input"
              />
            </div>

            <div className="form-stripe-field">
              <label htmlFor="bank-iban" className="field-label">
                IBAN
              </label>
              <input
                id="bank-iban"
                name="bank_iban"
                type="text"
                autoComplete="off"
                placeholder="CH93 0076 2011 6238 5295 7"
                defaultValue={bankAccount.iban}
                className="field-input"
              />
            </div>

            <div className="form-stripe-row">
              <div className="form-stripe-field">
                <label htmlFor="bank-bic" className="field-label">
                  BIC/SWIFT
                </label>
                <input
                  id="bank-bic"
                  name="bank_bic"
                  type="text"
                  autoComplete="off"
                  placeholder="POFICHBEXXX"
                  defaultValue={bankAccount.bic}
                  className="field-input"
                />
              </div>

              <div className="form-stripe-field">
                <label htmlFor="bank-name" className="field-label">
                  Banque
                </label>
                <input
                  id="bank-name"
                  name="bank_name"
                  type="text"
                  autoComplete="organization"
                  defaultValue={bankAccount.bankName}
                  className="field-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {state.message ? (
        <p
          className={`settings-form-feedback ${
            state.success ? "settings-form-feedback-success" : "settings-form-feedback-error"
          }`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn-primary form-stripe-submit"
        disabled={submitDisabled}
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
