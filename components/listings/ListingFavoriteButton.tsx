"use client";

import { useState, useTransition } from "react";
import { toggleFavorite } from "@/app/actions";
import type { ListingSource } from "@/lib/types";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-7-4.35-9.33-8.09C1.06 10.09 2.04 6.5 5.5 5.5c1.97-.58 4.03.24 5.17 1.89.47.67 1.19.67 1.66 0C13.46 5.74 15.53 4.92 17.5 5.5c3.46 1 4.44 4.59 2.83 7.41C19 16.65 12 21 12 21z"
      />
    </svg>
  );
}

type ListingFavoriteButtonProps = {
  listingId: string;
  src: ListingSource;
  initialFavorited: boolean;
  isLoggedIn: boolean;
  loginHref: string;
};

export function ListingFavoriteButton({
  listingId,
  src,
  initialFavorited,
  isLoggedIn,
  loginHref,
}: ListingFavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!isLoggedIn) {
      window.location.href = loginHref;
      return;
    }

    startTransition(async () => {
      const result = await toggleFavorite(listingId, src);
      if (result.success && result.favorited !== undefined) {
        setIsFavorited(result.favorited);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`listing-favorite-btn${isFavorited ? " listing-favorite-btn-active" : ""}`}
      aria-pressed={isFavorited}
      aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      disabled={pending}
    >
      <HeartIcon filled={isFavorited} />
    </button>
  );
}
