"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ListingPhotoGalleryProps = {
  photos: string[];
  alt: string;
  variant?: "page" | "compact";
  sizes?: string;
  showCounter?: boolean;
  fill?: boolean;
  overlay?: ReactNode;
  stopLinkNavigation?: boolean;
};

export function ListingPhotoGallery({
  photos,
  alt,
  variant = "page",
  sizes = "(max-width: 1023px) 100vw, 50vw",
  showCounter = variant === "page",
  fill = variant === "compact",
  overlay,
  stopLinkNavigation = false,
}: ListingPhotoGalleryProps) {
  const validPhotos = useMemo(
    () => photos.filter((photo) => photo?.startsWith("http")),
    [photos],
  );
  const [index, setIndex] = useState(0);
  const photoCount = validPhotos.length;
  const currentPhoto = validPhotos[index] ?? null;
  const hasMultiple = photoCount > 1;

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + photoCount) % photoCount);
  }, [photoCount]);

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % photoCount);
  }, [photoCount]);

  useEffect(() => {
    setIndex(0);
  }, [validPhotos]);

  useEffect(() => {
    if (!hasMultiple || variant !== "page") return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasMultiple, variant, goPrev, goNext]);

  function handleNav(
    event: React.MouseEvent<HTMLButtonElement>,
    action: () => void,
  ) {
    if (stopLinkNavigation) {
      event.preventDefault();
      event.stopPropagation();
    }
    action();
  }

  if (!currentPhoto) {
    return (
      <div
        className={`photo-gallery photo-gallery-${variant} ${
          fill ? "photo-gallery-fill" : ""
        }`}
      >
        <div className="photo-gallery-frame photo-gallery-frame-empty">
          <span className="text-xs text-[var(--muted-dim)]">Aucune image</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`photo-gallery photo-gallery-${variant} ${
        fill ? "photo-gallery-fill" : ""
      }`}
    >
      <div className="photo-gallery-frame">
        <Image
          key={currentPhoto}
          src={currentPhoto}
          alt={`${alt} — photo ${index + 1}`}
          fill
          className="photo-gallery-image object-cover"
          sizes={sizes}
          priority={index === 0}
          draggable={false}
        />

        {overlay}

        {hasMultiple ? (
          <>
            <button
              type="button"
              className="photo-gallery-nav photo-gallery-nav-prev"
              onClick={(event) => handleNav(event, goPrev)}
              aria-label="Photo précédente"
            >
              <ChevronLeft aria-hidden strokeWidth={2} />
            </button>
            <button
              type="button"
              className="photo-gallery-nav photo-gallery-nav-next"
              onClick={(event) => handleNav(event, goNext)}
              aria-label="Photo suivante"
            >
              <ChevronRight aria-hidden strokeWidth={2} />
            </button>
            {showCounter ? (
              <span className="photo-gallery-counter" aria-live="polite">
                {index + 1}/{photoCount}
              </span>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
