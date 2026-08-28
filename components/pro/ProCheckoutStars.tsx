"use client";

import { useState } from "react";
import { Star } from "lucide-react";

type StarIconProps = {
  filled?: boolean;
  className?: string;
};

export function ProCheckoutStarIcon({
  filled = true,
  className = "",
}: StarIconProps) {
  return (
    <Star
      aria-hidden
      className={`pro-checkout-star-icon ${className}`}
      fill={filled ? "currentColor" : "#ffffff"}
      stroke="currentColor"
      strokeWidth={1.25}
    />
  );
}

type ProCheckoutStarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
};

export function ProCheckoutStarRating({
  value,
  onChange,
  className = "",
}: ProCheckoutStarRatingProps) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div
      className={`pro-checkout-star-rating ${className}`}
      role="radiogroup"
      aria-label="Note sur 5"
      onMouseLeave={() => setHover(0)}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= display;

        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} sur 5`}
            className={`pro-checkout-star-btn ${
              filled ? "pro-checkout-star-btn-filled" : ""
            }`}
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHover(starValue)}
          >
            <ProCheckoutStarIcon filled={filled} />
          </button>
        );
      })}
    </div>
  );
}
