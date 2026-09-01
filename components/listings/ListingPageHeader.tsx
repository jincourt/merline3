"use client";

import { useState, useTransition } from "react";
import { Eye, Heart } from "lucide-react";
import { toggleFavorite } from "@/app/actions";
import { formatFavoriteCount, formatViewCount } from "@/lib/analytics";
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
  const views = Number.isFinite(sessionViews) ? Math.max(0, Math.floor(sessionViews)) : 0;

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
    <header className="listing-page-header">
      <h1 className="public-profile-name listing-page-title">{title}</h1>

      <div className="listing-page-engagement">
        <span className="listing-page-engagement-stat" aria-label={`${views} vue${views === 1 ? "" : "s"}`}>
          <Eye className="listing-page-engagement-icon" strokeWidth={1.75} aria-hidden />
          <span>{formatViewCount(views)}</span>
        </span>

        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`listing-page-engagement-stat listing-page-favorite-stat${
            isFavorited ? " listing-page-favorite-stat-active" : ""
          }`}
          aria-pressed={isFavorited}
          aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
          disabled={pending}
        >
          <Heart
            className="listing-page-engagement-icon"
            fill={isFavorited ? "currentColor" : "none"}
            strokeWidth={1.75}
            aria-hidden
          />
          <span>{formatFavoriteCount(favoriteCount)}</span>
        </button>
      </div>
    </header>
  );
}
