"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import type { CatalogListing } from "@/lib/types";
import {
  formatListingPrice,
  formatCatalogSalePrice,
} from "@/lib/catalog";
import { getAgentDisplayName } from "@/lib/agent-profiles";
import { getListingHref } from "@/lib/types";
import { MotionArticle } from "@/components/ui/motion";
import { ListingPhotoGallery } from "@/components/listings/ListingPhotoGallery";
import { ProfileAvatar } from "@/components/profiles/ProfileAvatar";
import { ProfileReviewStars } from "@/components/profiles/ProfileReviewForm";

function CatalogCardLocation({ address }: { address: string }) {
  if (!address.trim()) return null;

  return <p className="catalog-card-location">{address}</p>;
}

function CatalogCardRatingBadge({
  rating,
  count,
}: {
  rating: number | null;
  count: number;
}) {
  if (!count || rating === null) return null;

  return (
    <div
      className="catalog-card-rating-badge"
      aria-label={`${rating.toFixed(1)} sur 5, ${count} avis`}
    >
      <span>{rating.toFixed(1)}</span>
      <Star
        className="catalog-card-rating-badge-star"
        fill="currentColor"
        strokeWidth={1.5}
      />
      <span className="catalog-card-rating-badge-count">({count})</span>
    </div>
  );
}

function CatalogCardImage({
  photos,
  title,
  sizes,
  overlay,
}: {
  photos?: string[];
  title: string;
  sizes: string;
  overlay?: ReactNode;
}) {
  return (
    <div className="catalog-card-image">
      <ListingPhotoGallery
        photos={photos ?? []}
        alt={title}
        variant="compact"
        sizes={sizes}
        showCounter={false}
        fill
        overlay={overlay}
        stopLinkNavigation
      />
    </div>
  );
}

function CatalogCardHead({
  name,
  username,
  avatarUrl,
  averageRating,
  reviewCount,
  title,
  children,
}: {
  name: string;
  username: string;
  avatarUrl?: string;
  averageRating: number | null;
  reviewCount: number;
  title?: string;
  children?: ReactNode;
}) {
  const displayName = getAgentDisplayName({ name, username });

  if (title) {
    return (
      <div className="catalog-card-head catalog-card-head-stacked">
        {displayName ? (
          <ProfileAvatar
            name={name}
            username={username}
            avatarUrl={avatarUrl}
            size="md"
            className="catalog-card-head-avatar"
          />
        ) : null}
        <div className="catalog-card-head-copy">
          <h3 className="catalog-card-title">{title}</h3>
          {displayName ? (
            <span className="catalog-card-head-name">{displayName}</span>
          ) : null}
          {children}
        </div>
      </div>
    );
  }

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
  variant?: "list" | "grid" | "profile";
}) {
  const photos = listing.photos ?? [];
  const href = getListingHref(listing.id, listing.intent);
  const commission = formatListingPrice(listing);
  const salePrice = formatCatalogSalePrice(listing);

  if (variant === "grid") {
    return (
      <MotionArticle delay={delay} hoverLift={false} className="h-full">
        <Link href={href} className="catalog-card catalog-card-grid group flex h-full flex-col">
          <div className="catalog-card-grid-media">
            <CatalogCardImage
              photos={photos}
              title={listing.title}
              sizes="(max-width: 1024px) 50vw, 33vw"
              overlay={
                <CatalogCardRatingBadge
                  rating={listing.ownerAverageRating ?? null}
                  count={listing.ownerReviewCount ?? 0}
                />
              }
            />
          </div>

          <div className="catalog-card-content catalog-card-grid-body">
            <CatalogCardHead
              name={listing.ownerName ?? ""}
              username={listing.ownerUsername ?? ""}
              avatarUrl={listing.ownerAvatarUrl}
              averageRating={listing.ownerAverageRating ?? null}
              reviewCount={listing.ownerReviewCount ?? 0}
              title={listing.title}
            >
              <div className="catalog-card-head-meta">
                <CatalogCardFinanceBadge
                  listing={listing}
                  commission={commission}
                  salePrice={salePrice}
                />
                <CatalogCardLocation address={listing.address} />
              </div>
            </CatalogCardHead>
          </div>
        </Link>
      </MotionArticle>
    );
  }

  if (variant === "profile") {
    return (
      <MotionArticle delay={delay} hoverLift={false}>
        <Link href={href} className="catalog-card catalog-card-profile group">
          <div className="catalog-card-profile-media">
            <CatalogCardImage
              photos={photos}
              title={listing.title}
              sizes="15rem"
              overlay={
                <CatalogCardRatingBadge
                  rating={listing.ownerAverageRating ?? null}
                  count={listing.ownerReviewCount ?? 0}
                />
              }
            />
          </div>

          <div className="catalog-card-profile-body">
            <h3 className="catalog-card-title catalog-card-profile-title">
              {listing.title}
            </h3>

            {listing.category?.trim() ? (
              <span className="catalog-card-profile-tag">{listing.category}</span>
            ) : null}

            <div className="catalog-card-profile-foot">
              <CatalogCardFinanceBadge
                listing={listing}
                commission={commission}
                salePrice={salePrice}
              />

              <CatalogCardLocation address={listing.address} />
            </div>
          </div>
        </Link>
      </MotionArticle>
    );
  }

  return (
    <MotionArticle delay={delay} hoverLift={false}>
      <Link href={href} className="catalog-card catalog-card-list group">
        <div className="catalog-card-list-media">
          <CatalogCardImage
            photos={photos}
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
