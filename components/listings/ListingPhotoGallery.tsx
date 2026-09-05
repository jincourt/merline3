"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ListingPhotoGalleryProps = {
  photos: string[];
  alt: string;
};

export function ListingPhotoGallery({ photos, alt }: ListingPhotoGalleryProps) {
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
    if (!hasMultiple) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasMultiple, goPrev, goNext]);

  if (!currentPhoto) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-[var(--surface-elevated)] lg:aspect-square">
        <span className="text-sm text-[var(--muted-dim)]">Aucune image</span>
      </div>
    );
  }

  return (
    <div className="listing-photo-gallery">
      <div className="listing-photo-gallery-frame">
        <Image
          key={currentPhoto}
          src={currentPhoto}
          alt={`${alt} — photo ${index + 1}`}
          fill
          className="listing-photo-gallery-image object-cover"
          sizes="(max-width: 1023px) 100vw, 50vw"
          priority={index === 0}
        />

        {hasMultiple ? (
          <>
            <button
              type="button"
              className="listing-photo-gallery-nav listing-photo-gallery-nav-prev"
              onClick={goPrev}
              aria-label="Photo précédente"
            >
              <ChevronLeft aria-hidden strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className="listing-photo-gallery-nav listing-photo-gallery-nav-next"
              onClick={goNext}
              aria-label="Photo suivante"
            >
              <ChevronRight aria-hidden strokeWidth={1.75} />
            </button>
            <span className="listing-photo-gallery-counter" aria-live="polite">
              {index + 1} / {photoCount}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
