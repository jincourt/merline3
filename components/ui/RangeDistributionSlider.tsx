"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildValueHistogram,
  clampRangeValue,
  formatRangeNumber,
} from "@/lib/range-distribution";

type RangeDistributionSliderProps = {
  values: number[];
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
};

type DragTarget = "min" | "max" | null;

function parseBound(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function RangeDistributionSlider({
  values,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: RangeDistributionSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<DragTarget>(null);

  const histogram = useMemo(() => buildValueHistogram(values), [values]);
  const { bins, domainMin, domainMax, binSize, maxCount } = histogram;
  const hasData = values.length > 0 && bins.length > 0;

  const selectedMin = parseBound(minValue) ?? domainMin;
  const selectedMax = parseBound(maxValue) ?? domainMax;

  const minPercent =
    domainMax === domainMin
      ? 0
      : ((selectedMin - domainMin) / (domainMax - domainMin)) * 100;
  const maxPercent =
    domainMax === domainMin
      ? 100
      : ((selectedMax - domainMin) / (domainMax - domainMin)) * 100;

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || domainMax === domainMin) return domainMin;

      const rect = track.getBoundingClientRect();
      const ratio = clampRangeValue((clientX - rect.left) / rect.width, 0, 1);
      return Math.round(domainMin + ratio * (domainMax - domainMin));
    },
    [domainMin, domainMax],
  );

  const applyDragValue = useCallback(
    (target: DragTarget, nextValue: number) => {
      if (!target) return;

      if (target === "min") {
        const capped = clampRangeValue(nextValue, domainMin, selectedMax);
        if (capped <= domainMin) {
          onMinChange("");
          return;
        }
        onMinChange(String(capped));
        return;
      }

      const capped = clampRangeValue(nextValue, selectedMin, domainMax);
      if (capped >= domainMax) {
        onMaxChange("");
        return;
      }
      onMaxChange(String(capped));
    },
    [domainMin, domainMax, onMaxChange, onMinChange, selectedMax, selectedMin],
  );

  useEffect(() => {
    if (!dragging) return;

    function onPointerMove(event: PointerEvent) {
      applyDragValue(dragging, valueFromClientX(event.clientX));
    }

    function onPointerUp() {
      setDragging(null);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [applyDragValue, dragging, valueFromClientX]);

  function onTrackPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest(".range-distribution-thumb")) return;

    const nextValue = valueFromClientX(event.clientX);
    const distanceToMin = Math.abs(nextValue - selectedMin);
    const distanceToMax = Math.abs(nextValue - selectedMax);
    const target: DragTarget = distanceToMin <= distanceToMax ? "min" : "max";
    applyDragValue(target, nextValue);
    setDragging(target);
  }

  function startDrag(target: DragTarget) {
    return (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setDragging(target);
    };
  }

  if (!hasData) {
    return (
      <div className="range-distribution range-distribution-empty">
        <p className="range-distribution-empty-text">Pas assez de données</p>
      </div>
    );
  }

  return (
    <div className="range-distribution">
      <div className="range-distribution-chart" aria-hidden>
        {bins.map((count, index) => {
          const binStart = domainMin + index * binSize;
          const binEnd = binStart + binSize;
          const inRange = binEnd >= selectedMin && binStart <= selectedMax;
          const height = Math.max(12, (count / maxCount) * 100);

          return (
            <div
              key={index}
              className={`range-distribution-bar ${
                inRange ? "range-distribution-bar-active" : ""
              }`}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>

      <div
        ref={trackRef}
        className="range-distribution-slider"
        onPointerDown={onTrackPointerDown}
      >
        <div className="range-distribution-track" />
        <div
          className="range-distribution-range"
          style={{
            left: `${minPercent}%`,
            width: `${Math.max(maxPercent - minPercent, 0)}%`,
          }}
        />
        <button
          type="button"
          className="range-distribution-thumb range-distribution-thumb-min"
          style={{ left: `${minPercent}%` }}
          aria-label="Minimum"
          onPointerDown={startDrag("min")}
        />
        <button
          type="button"
          className="range-distribution-thumb range-distribution-thumb-max"
          style={{ left: `${maxPercent}%` }}
          aria-label="Maximum"
          onPointerDown={startDrag("max")}
        />
      </div>

      <div className="range-distribution-bounds">
        <span>{formatRangeNumber(domainMin)}</span>
        <span>{formatRangeNumber(domainMax)}</span>
      </div>
    </div>
  );
}
