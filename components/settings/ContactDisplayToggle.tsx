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

  return (
    <div className="settings-display-toggle">
      <input type="hidden" name={name} value={shown ? "1" : "0"} />
      <button
        type="button"
        className={`settings-display-toggle-btn ${
          shown ? "settings-display-toggle-btn-active" : ""
        }`}
        aria-pressed={shown}
        disabled={disabled}
        onClick={() => setShown((value) => !value)}
      >
        Affiché
      </button>
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
      <ContactDisplayToggle
        name={showName}
        defaultChecked={defaultShown}
        disabled={showDisabled}
      />
    </div>
  );
}
