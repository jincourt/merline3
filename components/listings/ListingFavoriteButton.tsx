"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/actions";
import type { ListingSource } from "@/lib/types";

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
      <Heart
        className="h-6 w-6"
        fill={isFavorited ? "currentColor" : "none"}
        strokeWidth={1.75}
        aria-hidden
      />
    </button>
  );
}
