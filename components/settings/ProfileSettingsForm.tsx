"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { checkUsernameAvailability } from "@/app/auth/actions";
import { updateProfile, type ActionResult } from "@/app/actions";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { ProfileLogoUpload } from "@/components/settings/ProfileLogoUpload";
import {
  ContactDisplayToggle,
  SettingsContactRow,
} from "@/components/settings/ContactDisplayToggle";
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
  const [bankOpen, setBankOpen] = useState(false);
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
    <form action={action} className="dashboard-settings-form">
      <div className="dashboard-settings-grid">
        <div className="dashboard-settings-card">
          <div className="dashboard-settings-col">
            <SelectDropdown
              id="profile-type"
              label="Type de profil"
              labelSpacing="md"
              value={profileType}
              onChange={(value) => {
                if (isValidProfileType(value)) setProfileType(value);
              }}
              options={profileTypeOptions}
              placeholder="Choisir un type"
            />
            <input type="hidden" name="profile_type" value={profileType} />

            <ProfileLogoUpload
              userId={userId}
              displayName={profile.name}
              username={profile.username}
              initialUrl={profile.avatarUrl}
            />

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

            {profileType === "agent" ? (
              <div>
                <label htmlFor="profile-description" className="field-label">
                  Description
                </label>
                <textarea
                  ref={textareaRef}
                  id="profile-description"
                  name="description"
                  rows={5}
                  maxLength={2000}
                  defaultValue={profile.description}
                  placeholder="Présentez votre expérience et votre réseau…"
                  className="field-input mt-2 min-h-[7rem] resize-y"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="profile-description-annonceur" className="field-label">
                  Description
                  <span className="ml-1 font-normal normal-case tracking-normal text-[var(--muted-dim)]">
                    (optionnel)
                  </span>
                </label>
                <textarea
                  ref={textareaRef}
                  id="profile-description-annonceur"
                  name="description"
                  rows={4}
                  maxLength={2000}
                  defaultValue={profile.description}
                  placeholder="Présentez-vous brièvement aux agents intéressés…"
                  className="field-input mt-2 min-h-[6rem] resize-y"
                />
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-settings-card">
          <div className="dashboard-settings-col">
            <div className="settings-contact-row">
              <div className="settings-contact-field">
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
              <ContactDisplayToggle
                name="show_address"
                defaultChecked={profile.showAddress}
                disabled={!profile.address.trim()}
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

            <div className="dashboard-bank-card">
              <button
                type="button"
                className="dashboard-bank-card-trigger"
                aria-expanded={bankOpen}
                onClick={() => setBankOpen((value) => !value)}
              >
                <span className="dashboard-bank-card-title">
                  {hasBankAccount(bankAccount)
                    ? "Compte bancaire"
                    : "Ajouter un compte bancaire"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                    bankOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              </button>

              <div
                className={`dashboard-bank-card-panel ${
                  bankOpen ? "dashboard-bank-card-panel-open" : ""
                }`}
              >
                <div className="dashboard-bank-card-body">
                  <div>
                    <label htmlFor="bank-account-name" className="field-label">
                      Nom du compte
                    </label>
                    <input
                      id="bank-account-name"
                      name="bank_account_name"
                      type="text"
                      autoComplete="name"
                      defaultValue={bankAccount.accountName}
                      className="field-input mt-2"
                    />
                  </div>

                  <div>
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
                      className="field-input mt-2"
                    />
                  </div>

                  <div>
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
                      className="field-input mt-2"
                    />
                  </div>

                  <div>
                    <label htmlFor="bank-name" className="field-label">
                      Banque
                    </label>
                    <input
                      id="bank-name"
                      name="bank_name"
                      type="text"
                      autoComplete="organization"
                      defaultValue={bankAccount.bankName}
                      className="field-input mt-2"
                    />
                  </div>
                </div>
              </div>
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
