"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { RangeDistributionSlider } from "@/components/ui/RangeDistributionSlider";

type RangeFilterDropdownProps = {
  id?: string;
  label: string;
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  distributionValues?: number[];
  minPlaceholder?: string;
  maxPlaceholder?: string;
  suffix?: string;
  className?: string;
  disabled?: boolean;
};

function formatRangeSummary(
  label: string,
  min: string,
  max: string,
  suffix?: string,
): string {
  const hasMin = min.trim() !== "";
  const hasMax = max.trim() !== "";
  const unit = suffix ? ` ${suffix}` : "";

  if (!hasMin && !hasMax) return label;
  if (hasMin && hasMax) return `${min} – ${max}${unit}`;
  if (hasMin) return `≥ ${min}${unit}`;
  return `≤ ${max}${unit}`;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <ChevronDown
      aria-hidden
      className={`h-3.5 w-3.5 shrink-0 text-[var(--muted-dim)] transition-transform duration-150 ${
        open ? "rotate-180" : ""
      }`}
      strokeWidth={1.5}
    />
  );
}

export function RangeFilterDropdown({
  id,
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  distributionValues = [],
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
  suffix,
  className = "",
  disabled = false,
}: RangeFilterDropdownProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const panelId = `${triggerId}-panel`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const hasFilter = minValue.trim() !== "" || maxValue.trim() !== "";
  const summary = formatRangeSummary(label, minValue, maxValue, suffix);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function clearRange() {
    onMinChange("");
    onMaxChange("");
  }

  return (
    <div
      ref={containerRef}
      className={`range-filter-dropdown ${open ? "range-filter-dropdown-open" : ""} ${className}`.trim()}
    >
      <button
        id={triggerId}
        type="button"
        className={`catalog-toolbar-trigger ${
          hasFilter ? "catalog-toolbar-trigger-active" : ""
        } ${disabled ? "catalog-toolbar-trigger-disabled" : ""}`.trim()}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
      >
        <span className="truncate">{summary}</span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div id={panelId} className="range-filter-dropdown-panel">
          <div className="range-filter-panel">
            <div className="range-filter-inputs">
              <label className="range-filter-field">
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={minValue}
                  onChange={(event) => onMinChange(event.target.value)}
                  placeholder={minPlaceholder}
                  className="range-filter-input"
                  aria-label={`${label} minimum`}
                />
              </label>
              <label className="range-filter-field">
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={maxValue}
                  onChange={(event) => onMaxChange(event.target.value)}
                  placeholder={maxPlaceholder}
                  className="range-filter-input"
                  aria-label={`${label} maximum`}
                />
              </label>
            </div>

            <RangeDistributionSlider
              values={distributionValues}
              minValue={minValue}
              maxValue={maxValue}
              onMinChange={onMinChange}
              onMaxChange={onMaxChange}
            />

            {hasFilter ? (
              <div className="range-filter-actions">
                <button
                  type="button"
                  className="range-filter-clear"
                  onClick={clearRange}
                >
                  Effacer
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
