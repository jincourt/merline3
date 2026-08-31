"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatCategoryLabel,
  getCategoryGroupsForType,
  isSameCategorySelection,
  type CategorySelection,
} from "@/lib/categories";
import type { ListingType } from "@/lib/types";

type CategoryPickerProps = {
  listingType: ListingType;
  selected: CategorySelection[];
  onSelectedChange: (selected: CategorySelection[]) => void;
};

type PanelView = "parents" | "subs" | "custom";

export function CategoryPicker({
  listingType,
  selected,
  onSelectedChange,
}: CategoryPickerProps) {
  const generatedId = useId();
  const triggerId = `${generatedId}-trigger`;
  const listboxId = `${generatedId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelView, setPanelView] = useState<PanelView>("parents");
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const [customDraft, setCustomDraft] = useState("");

  const groups = getCategoryGroupsForType(listingType);
  const activeGroup = groups.find((group) => group.label === activeParent);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPanelView("parents");
    setActiveParent(null);
    setCustomDraft("");
  }, [listingType]);

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
      closeDropdown();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDropdown();
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

  useEffect(() => {
    if (open && panelView === "custom") {
      customInputRef.current?.focus();
    }
  }, [open, panelView]);

  function closeDropdown() {
    setOpen(false);
    setPanelView("parents");
    setActiveParent(null);
    setCustomDraft("");
  }

  function openDropdown() {
    setPanelView("parents");
    setActiveParent(null);
    setCustomDraft("");
    setOpen(true);
  }

  function goToParent(parent: string) {
    setActiveParent(parent);
    if (parent === "Personnalisé") {
      setPanelView("custom");
      setCustomDraft("");
      return;
    }
    setPanelView("subs");
  }

  function goBackToParents() {
    setPanelView("parents");
    setActiveParent(null);
    setCustomDraft("");
  }

  function isSubSelected(sub: string) {
    if (!activeParent) return false;
    return selected.some((item) =>
      isSameCategorySelection(item, { parent: activeParent, sub }),
    );
  }

  function toggleSubcategory(sub: string) {
    if (!activeParent) return;

    const next = { parent: activeParent, sub };
    const existingIndex = selected.findIndex((item) =>
      isSameCategorySelection(item, next),
    );

    if (existingIndex >= 0) {
      onSelectedChange(selected.filter((_, index) => index !== existingIndex));
      closeDropdown();
      return;
    }

    onSelectedChange([...selected, next]);
    closeDropdown();
  }

  function handleCustomAdd() {
    const label = customDraft.trim();
    if (!label) return;

    const next = { parent: "Personnalisé", sub: label };
    const existingIndex = selected.findIndex((item) =>
      isSameCategorySelection(item, next),
    );

    if (existingIndex >= 0) {
      closeDropdown();
      return;
    }

    onSelectedChange([...selected, next]);
    closeDropdown();
  }

  function removeSelection(item: CategorySelection) {
    onSelectedChange(
      selected.filter((current) => !isSameCategorySelection(current, item)),
    );
  }

  function panelTitle() {
    if (panelView === "subs" && activeParent) return activeParent;
    if (panelView === "custom") return "Personnalisé";
    return "Catégorie";
  }

  const panelContent = (
    <div className="category-dropdown-panel-inner">
      {panelView !== "parents" ? (
        <div className="category-dropdown-panel-head">
          <button
            type="button"
            className="category-dropdown-back"
            onClick={goBackToParents}
          >
            <ChevronLeft aria-hidden className="h-4 w-4" strokeWidth={1.5} />
            Retour
          </button>
        </div>
      ) : null}

      {panelView === "parents" ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={triggerId}
          className="select-dropdown-list"
        >
          {groups.map((group) => (
            <li key={group.label} role="presentation">
              <button
                type="button"
                role="option"
                className="select-dropdown-option category-dropdown-option-parent"
                onClick={() => goToParent(group.label)}
              >
                <span>{group.label}</span>
                <ChevronRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-[var(--muted)]"
                  strokeWidth={1.5}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {panelView === "subs" && activeGroup ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={triggerId}
          className="select-dropdown-list"
        >
          {activeGroup.subcategories.map((sub) => {
            const isSelected = isSubSelected(sub);
            return (
              <li key={sub} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`select-dropdown-option ${
                    isSelected ? "select-dropdown-option-active" : ""
                  }`}
                  onClick={() => toggleSubcategory(sub)}
                >
                  <span>{sub}</span>
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
      ) : null}

      {panelView === "custom" ? (
        <div className="category-dropdown-custom">
          <label htmlFor={`${generatedId}-custom`} className="field-label">
            Nom de la catégorie
          </label>
          <input
            ref={customInputRef}
            id={`${generatedId}-custom`}
            value={customDraft}
            onChange={(event) => setCustomDraft(event.target.value)}
            placeholder="Votre catégorie"
            className="field-input mt-2"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleCustomAdd();
              }
            }}
          />
          <button
            type="button"
            className="btn-ghost category-dropdown-custom-submit"
            onClick={handleCustomAdd}
            disabled={!customDraft.trim()}
          >
            Ajouter
          </button>
        </div>
      ) : null}
    </div>
  );

  const mobileDialog =
    open && mobile && mounted ? (
      <div
        className="dialog-overlay"
        role="presentation"
        onClick={closeDropdown}
      >
        <div
          ref={dialogRef}
          className="select-dropdown-dialog category-dropdown-dialog"
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
              {panelTitle()}
            </p>
            <button
              type="button"
              className="text-[var(--muted)] hover:text-[var(--foreground)]"
              aria-label="Fermer"
              onClick={closeDropdown}
            >
              ✕
            </button>
          </div>
          {panelContent}
        </div>
      </div>
    ) : null;

  return (
    <div className="category-picker">
      {selected.length > 0 ? (
        <div className="category-picker-selected">
          <span className="field-label">Catégorie</span>
          <div className="category-picker-chips">
            {selected.map((item) => (
              <span key={`${item.parent}-${item.sub}`} className="category-picker-chip">
                {item.parent === "Personnalisé"
                  ? item.sub
                  : formatCategoryLabel(item)}
                <button
                  type="button"
                  className="category-picker-chip-remove"
                  onClick={() => removeSelection(item)}
                  aria-label="Retirer la catégorie"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div
        ref={containerRef}
        className={`select-dropdown form-stripe-select category-dropdown ${
          open ? "select-dropdown-open" : ""
        }`}
      >
        <button
          id={triggerId}
          type="button"
          className="select-dropdown-trigger select-dropdown-trigger-placeholder"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label="Catégorie"
          onClick={() => {
            if (open) {
              closeDropdown();
              return;
            }
            openDropdown();
          }}
        >
          <span className="truncate">
            {selected.length > 0
              ? "Ajouter une catégorie…"
              : "Sélectionner une catégorie…"}
          </span>
          <ChevronDown
            aria-hidden
            className={`h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-150 ${
              open ? "rotate-180" : ""
            }`}
            strokeWidth={1.5}
          />
        </button>

        {open && !mobile ? (
          <div className="select-dropdown-panel category-dropdown-panel">
            {panelContent}
          </div>
        ) : null}
      </div>

      {mobileDialog ? createPortal(mobileDialog, document.body) : null}
    </div>
  );
}
