"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

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
  active?: boolean;
  mobileBehavior?: "dialog" | "inline";
  portalPanel?: boolean;
  panelAlign?: "start" | "end";
};

function ChevronIcon({ open, compact = false }: { open: boolean; compact?: boolean }) {
  return (
    <ChevronDown
      aria-hidden
      className={`shrink-0 text-[var(--muted)] transition-transform duration-150 select-dropdown-chevron ${
        compact ? "h-3.5 w-3.5" : "h-4 w-4"
      } ${open ? "rotate-180" : ""}`}
      strokeWidth={1.5}
    />
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
  active = false,
  mobileBehavior = "dialog",
  portalPanel = false,
  panelAlign = "start",
}: SelectDropdownProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const listboxId = `${triggerId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

  const selected = options.find((option) => option.value === value);
  const displayLabel = selected?.label ?? placeholder;
  const useInlineMobilePanel = mobileBehavior === "inline";
  const usePortaledPanel = portalPanel && mounted;
  const showInlinePanel = open && (!mobile || useInlineMobilePanel) && !usePortaledPanel;
  const showPortaledPanel = open && (!mobile || useInlineMobilePanel) && usePortaledPanel;
  const showMobileDialog =
    open && mobile && !useInlineMobilePanel && mounted;

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
        panelRef.current?.contains(target) ||
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

    if (mobile && !useInlineMobilePanel) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, mobile, useInlineMobilePanel]);

  useLayoutEffect(() => {
    if (!showPortaledPanel) return;

    function updatePanelPosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const minWidth = Math.max(rect.width, 176);
      const gutter = 8;
      const left =
        panelAlign === "end"
          ? Math.max(gutter, rect.right - minWidth)
          : Math.min(rect.left, window.innerWidth - minWidth - gutter);

      setPanelStyle({
        position: "fixed",
        top: rect.bottom + 6,
        left,
        right: "auto",
        minWidth,
        width: "max-content",
        zIndex: 9999,
      });
    }

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [showPortaledPanel, panelAlign, options.length]);

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
                <Check
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-[var(--indigo)]"
                  strokeWidth={1.5}
                />
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

  const mobileDialog = showMobileDialog ? (
    <div
      className="dialog-overlay"
      role="presentation"
      onClick={() => setOpen(false)}
    >
      <div
        ref={dialogRef}
        className={`select-dropdown-dialog${
          portalPanel ? " select-dropdown-dialog-light" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${triggerId}-dialog-title`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="select-dropdown-dialog-header">
          <p
            id={`${triggerId}-dialog-title`}
            className={
              portalPanel
                ? "text-sm font-medium text-[#0a2540]"
                : "text-sm font-medium text-[var(--foreground)]"
            }
          >
            {label ?? placeholder}
          </p>
          <button
            type="button"
            className={
              portalPanel
                ? "text-[#6b7c93] hover:text-[#0a2540]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }
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
        ref={triggerRef}
        id={triggerId}
        type="button"
        className={`select-dropdown-trigger ${label ? triggerSpacing : ""} ${
          !selected ? "select-dropdown-trigger-placeholder" : ""
        } ${active ? "select-dropdown-trigger-active" : ""} ${
          disabled ? "select-dropdown-trigger-disabled" : ""
        }`.trim()}
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

      {showInlinePanel ? (
        <div className="select-dropdown-panel">{optionList}</div>
      ) : null}

      {showPortaledPanel
        ? createPortal(
            <div
              ref={panelRef}
              className="select-dropdown-panel select-dropdown-panel-portal"
              style={panelStyle}
            >
              {optionList}
            </div>,
            document.body,
          )
        : null}

      {mobileDialog ? createPortal(mobileDialog, document.body) : null}
    </div>
  );
}
