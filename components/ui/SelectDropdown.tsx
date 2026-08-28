"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type SelectDropdownOption = {
  value: string;
  label: string;
};

type SelectDropdownProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectDropdownOption[];
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  labelSpacing?: "sm" | "md" | "lg";
  disabled?: boolean;
  size?: "default" | "compact";
};

function ChevronIcon({ open, compact = false }: { open: boolean; compact?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={`shrink-0 text-[var(--muted)] transition-transform duration-150 select-dropdown-chevron ${
        compact ? "h-3.5 w-3.5" : "h-4 w-4"
      } ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SelectDropdown({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Sélectionner…",
  className = "",
  labelClassName = "field-label",
  labelSpacing,
  disabled = false,
  size = "default",
}: SelectDropdownProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const listboxId = `${triggerId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const selected = options.find((option) => option.value === value);
  const displayLabel = selected?.label ?? placeholder;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");

    function sync() {
      setMobile(media.matches);
    }

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        dialogRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    if (mobile) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, mobile]);

  function selectOption(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
  }

  const optionList = (
    <ul
      id={listboxId}
      role="listbox"
      aria-labelledby={triggerId}
      className="select-dropdown-list"
    >
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <li key={option.value || "__empty__"} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              className={`select-dropdown-option ${
                isSelected ? "select-dropdown-option-active" : ""
              }`}
              onClick={() => selectOption(option.value)}
            >
              <span>{option.label}</span>
              {isSelected ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-4 w-4 shrink-0 text-[var(--indigo)]"
                >
                  <path
                    d="M5 10L8.5 13.5L15 7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );

  const triggerSpacing =
    labelSpacing === "lg"
      ? "mt-4"
      : labelSpacing === "md" || labelClassName !== "field-label"
        ? "mt-3"
        : "mt-2";

  const mobileDialog =
    open && mobile && mounted ? (
      <div
        className="dialog-overlay"
        role="presentation"
        onClick={() => setOpen(false)}
      >
        <div
          ref={dialogRef}
          className="select-dropdown-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${triggerId}-dialog-title`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="select-dropdown-dialog-header">
            <p
              id={`${triggerId}-dialog-title`}
              className="text-sm font-medium text-[var(--foreground)]"
            >
              {label ?? placeholder}
            </p>
            <button
              type="button"
              className="text-[var(--muted)] hover:text-[var(--foreground)]"
              aria-label="Fermer"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>
          {optionList}
        </div>
      </div>
    ) : null;

  return (
    <div
      ref={containerRef}
      className={`select-dropdown ${size === "compact" ? "select-dropdown-compact" : ""} ${
        open ? "select-dropdown-open" : ""
      } ${className}`.trim()}
    >
      {label ? (
        <label htmlFor={triggerId} className={labelClassName}>
          {label}
        </label>
      ) : null}

      <button
        id={triggerId}
        type="button"
        className={`select-dropdown-trigger ${label ? triggerSpacing : ""} ${
          !selected ? "select-dropdown-trigger-placeholder" : ""
        } ${disabled ? "select-dropdown-trigger-disabled" : ""}`.trim()}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={label ?? placeholder}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronIcon open={open} compact={size === "compact"} />
      </button>

      {open && !mobile ? (
        <div className="select-dropdown-panel">{optionList}</div>
      ) : null}

      {mobileDialog ? createPortal(mobileDialog, document.body) : null}
    </div>
  );
}
