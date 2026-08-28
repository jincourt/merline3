"use client";

import Link from "next/link";
import { ProfileAvatar } from "@/components/profiles/ProfileAvatar";
import { ProfileReviewStars } from "@/components/profiles/ProfileReviewForm";
import { getProfileHref } from "@/lib/profile-reviews";

type ListingOwnerPreviewProps = {
  name: string;
  username: string;
  avatarUrl?: string;
  averageRating?: number | null;
  reviewCount?: number;
};

export function ListingOwnerPreview({
  name,
  username,
  avatarUrl,
  averageRating = null,
  reviewCount = 0,
}: ListingOwnerPreviewProps) {
  const displayName = name.trim() || username;

  return (
    <div className="listing-owner-preview">
      <Link href={getProfileHref(username)} className="listing-owner-row">
        <ProfileAvatar
          name={name}
          username={username}
          avatarUrl={avatarUrl}
          size="md"
        />
        <div className="listing-owner-meta">
          <div className="listing-owner-heading">
            <span className="listing-owner-name">{displayName}</span>
            <ProfileReviewStars
              rating={averageRating}
              count={reviewCount}
              singleStar
              className="listing-owner-rating"
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
