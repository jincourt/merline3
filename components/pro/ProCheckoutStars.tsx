"use client";

import { useState } from "react";

type StarIconProps = {
  filled?: boolean;
  className?: string;
};

export function ProCheckoutStarIcon({
  filled = true,
  className = "",
}: StarIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`pro-checkout-star-icon ${className}`}
    >
      <path
        d="M10 1.5L12.472 7.236L18.66 8.028L14.33 12.264L15.416 18.42L10 15.618L4.584 18.42L5.67 12.264L1.34 8.028L7.528 7.236L10 1.5Z"
        fill={filled ? "currentColor" : "#ffffff"}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
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
