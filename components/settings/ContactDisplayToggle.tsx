"use client";

import { useState } from "react";

export function ContactDisplayToggle({
  name,
  defaultChecked,
  disabled = false,
}: {
  name: string;
  defaultChecked: boolean;
  disabled?: boolean;
}) {
  const [shown, setShown] = useState(defaultChecked);
  const checkboxId = `${name}-toggle`;

  return (
    <div className="settings-display-toggle">
      <input type="hidden" name={name} value={shown ? "1" : "0"} />
      <input
        id={checkboxId}
        type="checkbox"
        checked={shown}
        disabled={disabled}
        className="settings-display-toggle-checkbox"
        aria-label="Afficher publiquement"
        onChange={(event) => setShown(event.target.checked)}
      />
    </div>
  );
}

export function SettingsContactRow({
  id,
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  autoComplete,
  readOnly = false,
  showName,
  defaultShown,
  showDisabled = false,
  showVisibilityLabel = false,
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  autoComplete?: string;
  readOnly?: boolean;
  showName: string;
  defaultShown: boolean;
  showDisabled?: boolean;
  showVisibilityLabel?: boolean;
}) {
  return (
    <div className="settings-contact-row">
      <div className="settings-contact-field">
        <label htmlFor={id} className="field-label">
          {label}
        </label>
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          defaultValue={defaultValue}
          readOnly={readOnly}
          className={`field-input mt-2 ${readOnly ? "settings-contact-readonly" : ""}`}
        />
      </div>
      <div className="settings-display-toggle-col">
        <span
          className={`field-label settings-contact-visibility-label ${
            showVisibilityLabel ? "" : "invisible"
          }`}
          aria-hidden={!showVisibilityLabel}
        >
          Visibilité
        </span>
        <ContactDisplayToggle
          name={showName}
          defaultChecked={defaultShown}
          disabled={showDisabled}
        />
      </div>
    </div>
  );
}
