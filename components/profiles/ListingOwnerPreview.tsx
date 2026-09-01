"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ProfileAvatar } from "@/components/profiles/ProfileAvatar";
import { ProfileReviewStars } from "@/components/profiles/ProfileReviewForm";
import { getProfileHref } from "@/lib/profile-reviews";

type ListingOwnerPreviewProps = {
  name: string;
  username: string;
  avatarUrl?: string;
  averageRating?: number | null;
  reviewCount?: number;
  actions?: ReactNode;
};

export function ListingOwnerPreview({
  name,
  username,
  avatarUrl,
  averageRating = null,
  reviewCount = 0,
  actions,
}: ListingOwnerPreviewProps) {
  const displayName = name.trim() || username;
  const profileHref = getProfileHref(username);

  return (
    <div className="listing-owner-head">
      <div className="listing-owner-row">
        <Link href={profileHref} className="listing-owner-avatar-link">
          <ProfileAvatar
            name={name}
            username={username}
            avatarUrl={avatarUrl}
            size="md"
          />
        </Link>

        <div className="listing-owner-meta">
          <Link href={profileHref} className="listing-owner-name">
            {displayName}
          </Link>
          <Link href={profileHref} className="listing-owner-username">
            @{username}
          </Link>
          <ProfileReviewStars
            rating={averageRating}
            count={reviewCount}
            singleStar
            showReviewCount
            countFormat="parens"
            className="listing-owner-rating"
          />
        </div>
      </div>

      {actions ? <div className="listing-owner-head-actions">{actions}</div> : null}
    </div>
  );
}
