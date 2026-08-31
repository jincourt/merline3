"use client";

import Link from "next/link";
import Image from "next/image";
import type { CatalogListing } from "@/lib/types";
import {
  formatListingPrice,
  formatCatalogSalePrice,
} from "@/lib/catalog";
import { getAgentDisplayName } from "@/lib/agent-profiles";
import { getListingHref } from "@/lib/types";
import { MotionArticle } from "@/components/ui/motion";
import { ProfileAvatar } from "@/components/profiles/ProfileAvatar";
import { ProfileReviewStars } from "@/components/profiles/ProfileReviewForm";

function CatalogCardLocation({ address }: { address: string }) {
  if (!address.trim()) return null;

  return <p className="catalog-card-location">{address}</p>;
}
function ListingImage({
  image,
  title,
  sizes,
}: {
  image?: string;
  title: string;
  sizes: string;
}) {
  return (
    <div className="catalog-card-image">
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes={sizes}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-xs text-[var(--muted-dim)]">Aucune image</span>
        </div>
      )}
    </div>
  );
}

function CatalogCardHead({
  name,
  username,
  avatarUrl,
  averageRating,
  reviewCount,
}: {
  name: string;
  username: string;
  avatarUrl?: string;
  averageRating: number | null;
  reviewCount: number;
}) {
  const displayName = getAgentDisplayName({ name, username });
  if (!displayName) return null;

  return (
    <div className="catalog-card-head">
      <div className="catalog-card-head-brand">
        <ProfileAvatar
          name={name}
          username={username}
          avatarUrl={avatarUrl}
          size="sm"
          className="catalog-card-head-avatar"
        />
        <span className="catalog-card-head-name">{displayName}</span>
      </div>
      <ProfileReviewStars
        rating={averageRating}
        count={reviewCount}
        singleStar
        showReviewCount
        countFormat="parens"
        className="catalog-card-head-rating"
      />
    </div>
  );
}

function CatalogCardFinanceBadge({
  listing,
  commission,
  salePrice,
}: {
  listing: CatalogListing;
  commission: string;
  salePrice: string;
}) {
  const showSalePrice = listing.intent === "sell" && listing.price != null;

  return (
    <p className="catalog-card-finance">
      {showSalePrice ? (
        <>
          <span className="catalog-card-finance-price">{salePrice}</span>
          <span className="catalog-card-finance-sep" aria-hidden>
            ·
          </span>
        </>
      ) : null}
      <span className="catalog-card-finance-commission">{commission}</span>
    </p>
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
  const salePrice = formatCatalogSalePrice(listing);

  if (variant === "grid") {
    return (
      <MotionArticle delay={delay} hoverLift={false} className="h-full">
        <Link href={href} className="catalog-card catalog-card-grid group flex h-full flex-col">
          <CatalogCardHead
            name={listing.ownerName ?? ""}
            username={listing.ownerUsername ?? ""}
            avatarUrl={listing.ownerAvatarUrl}
            averageRating={listing.ownerAverageRating ?? null}
            reviewCount={listing.ownerReviewCount ?? 0}
          />

          <ListingImage
            image={image}
            title={listing.title}
            sizes="(max-width: 1024px) 50vw, 33vw"
          />

          <div className="catalog-card-content">
            <h3 className="catalog-card-title">{listing.title}</h3>

            <CatalogCardFinanceBadge
              listing={listing}
              commission={commission}
              salePrice={salePrice}
            />

            <CatalogCardLocation address={listing.address} />
          </div>
        </Link>
      </MotionArticle>
    );
  }

  return (
    <MotionArticle delay={delay} hoverLift={false}>
      <Link href={href} className="catalog-card catalog-card-list group">
        <div className="catalog-card-list-media">
          <ListingImage
            image={image}
            title={listing.title}
            sizes="(max-width: 768px) 100vw, 200px"
          />
        </div>

        <div className="catalog-card-list-body">
          <CatalogCardHead
            name={listing.ownerName ?? ""}
            username={listing.ownerUsername ?? ""}
            avatarUrl={listing.ownerAvatarUrl}
            averageRating={listing.ownerAverageRating ?? null}
            reviewCount={listing.ownerReviewCount ?? 0}
          />

          <h3 className="catalog-card-title catalog-card-title-list">{listing.title}</h3>

          <CatalogCardFinanceBadge
            listing={listing}
            commission={commission}
            salePrice={salePrice}
          />

          <CatalogCardLocation address={listing.address} />

          <p className="catalog-card-excerpt">{listing.description}</p>

          <div className="catalog-card-list-foot">
            <span className="catalog-card-link">Voir l&apos;annonce →</span>
          </div>
        </div>
      </Link>
    </MotionArticle>
  );
}
