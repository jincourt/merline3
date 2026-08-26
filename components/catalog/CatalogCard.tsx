"use client";

import Link from "next/link";
import Image from "next/image";
import type { CatalogListing } from "@/lib/types";
import { formatListingPrice } from "@/lib/catalog";
import { getListingHref } from "@/lib/types";
import { MotionArticle } from "@/components/ui/motion";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function ListingImage({
  image,
  title,
  commission,
  sizes,
}: {
  image?: string;
  title: string;
  commission: string;
  sizes: string;
}) {
  return (
    <div className="relative aspect-square overflow-hidden bg-[var(--surface-elevated)]">
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes={sizes}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-xs text-[var(--muted-dim)]">Aucune image</span>
        </div>
      )}
      <span className="catalog-commission-badge">{commission}</span>
    </div>
  );
}

export function CatalogCard({
  listing,
  delay = 0,
  variant = "list",
}: {
  listing: CatalogListing;
  delay?: number;
  variant?: "list" | "grid";
}) {
  const image = listing.photos?.find((photo) => photo?.startsWith("http"));
  const href = getListingHref(listing.id, listing.intent);
  const commission = formatListingPrice(listing);

  if (variant === "grid") {
    return (
      <MotionArticle delay={delay} className="h-full">
        <Link href={href} className="card-case group flex h-full flex-col">
          <ListingImage
            image={image}
            title={listing.title}
            commission={commission}
            sizes="(max-width: 1024px) 50vw, 33vw"
          />

          <div className="flex flex-1 flex-col p-4">
            <h3 className="line-clamp-2 text-sm font-medium tracking-tight text-[var(--foreground)]">
              {listing.title}
            </h3>

            <p className="mt-2 line-clamp-1 text-xs text-[var(--muted-dim)]">
              {listing.category} · {listing.address}
            </p>
          </div>
        </Link>
      </MotionArticle>
    );
  }

  return (
    <MotionArticle delay={delay}>
      <Link href={href} className="card-case group grid md:grid-cols-[160px_1fr]">
        <ListingImage
          image={image}
          title={listing.title}
          commission={commission}
          sizes="(max-width: 768px) 100vw, 160px"
        />

        <div className="flex flex-col p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium tracking-tight text-[var(--foreground)]">
                {listing.title}
              </h3>
              <p className="mt-1 text-xs text-[var(--muted-dim)]">{listing.category}</p>
            </div>
            <span className="font-mono text-xs text-[var(--muted-dim)]">
              {formatDate(listing.created_at)}
            </span>
          </div>

          <h4 className="mt-5 text-sm font-medium text-[var(--foreground)]">
            {listing.address}
          </h4>

          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
            {listing.description}
          </p>

          <div className="mt-auto flex items-center justify-between pt-8">
            <span className="text-[10px] uppercase tracking-widest text-[var(--muted-dim)]">
              Multi-diffusion
            </span>
            <span className="btn-link">Voir l&apos;annonce</span>
          </div>
        </div>
      </Link>
    </MotionArticle>
  );
}
