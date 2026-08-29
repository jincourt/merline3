"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/actions";
import { ListingEngagementStats } from "@/components/analytics/ListingEngagementStats";
import type { ListingSource } from "@/lib/types";

type ListingPageHeaderProps = {
  title: string;
  sessionViews?: number;
  initialFavoriteCount?: number;
  listingId: string;
  src: ListingSource;
  initialFavorited: boolean;
  isLoggedIn: boolean;
  loginHref: string;
};

export function ListingPageHeader({
  title,
  sessionViews = 0,
  initialFavoriteCount = 0,
  listingId,
  src,
  initialFavorited,
  isLoggedIn,
  loginHref,
}: ListingPageHeaderProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount);
  const [pending, startTransition] = useTransition();

  function handleFavoriteClick() {
    if (!isLoggedIn) {
      window.location.href = loginHref;
      return;
    }

    startTransition(async () => {
      const result = await toggleFavorite(listingId, src);
      if (!result.success || result.favorited === undefined) return;

      setIsFavorited(result.favorited);
      if (typeof result.favoriteCount === "number") {
        setFavoriteCount(result.favoriteCount);
      } else {
        setFavoriteCount((current) =>
          result.favorited ? current + 1 : Math.max(0, current - 1),
        );
      }
    });
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
        <button
          type="button"
          onClick={handleFavoriteClick}
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
      </div>
      <ListingEngagementStats
        views={sessionViews}
        favorites={favoriteCount}
        variant="listing"
        className="mt-3"
      />
    </>
  );
}
