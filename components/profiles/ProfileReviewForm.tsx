"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { submitProfileReview, type ActionResult } from "@/app/actions";
import { ProCheckoutStarRating } from "@/components/pro/ProCheckoutStars";

const initialState: ActionResult = { success: false, message: "" };

type ProfileReviewFormProps = {
  profileId: string;
  username: string;
  listingId?: string;
  listingSrc?: string;
  initialRating?: number;
  initialComment?: string;
};

export function ProfileReviewForm({
  profileId,
  username,
  listingId,
  listingSrc,
  initialRating = 0,
  initialComment = "",
}: ProfileReviewFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(initialRating);
  const [state, action, pending] = useActionState(submitProfileReview, initialState);

  const hasExisting = initialRating > 0;

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      router.refresh();
    }
  }, [state.success, router]);

  if (hasExisting) {
    return null;
  }

  return (
    <div className="profile-review-form-wrap">
      <button
        type="button"
        className="btn-ghost text-sm"
        onClick={() => setOpen((value) => !value)}
      >
        Ajouter un avis
      </button>

      {open ? (
        <form action={action} className="profile-review-form">
          <input type="hidden" name="profile_id" value={profileId} />
          <input type="hidden" name="username" value={username} />
          {listingId ? <input type="hidden" name="listing_id" value={listingId} /> : null}
          {listingSrc ? <input type="hidden" name="listing_src" value={listingSrc} /> : null}
          <input type="hidden" name="rating" value={rating || ""} />

          <ProCheckoutStarRating value={rating} onChange={setRating} />

          <textarea
            name="comment"
            rows={4}
            maxLength={1000}
            defaultValue={initialComment}
            placeholder="Partagez votre expérience…"
            className="field-input min-h-[6rem] resize-y"
          />

          {state.message ? (
            <p
              className={`text-sm ${
                state.success ? "text-[var(--success)]" : "text-[var(--error)]"
              }`}
              role="status"
            >
              {state.message}
            </p>
          ) : null}

          <div className="profile-review-form-actions">
            <button
              type="button"
              className="btn-ghost text-sm"
              onClick={() => setOpen(false)}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-form btn-primary text-sm"
              disabled={pending || rating < 1}
            >
        {pending ? "Enregistrement…" : "Publier"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

export function ProfileReviewStars({
  rating,
  count,
  className = "",
  singleStar = false,
  showReviewCount = true,
  countFormat = "label",
}: {
  rating: number | null;
  count: number;
  className?: string;
  singleStar?: boolean;
  showReviewCount?: boolean;
  countFormat?: "label" | "parens";
}) {
  if (!count || rating === null) return null;

  const countSuffix =
    showReviewCount && countFormat === "parens"
      ? ` (${count})`
      : showReviewCount
        ? ` · ${count} avis`
        : "";

  return (
    <div className={`profile-review-summary ${className}`.trim()}>
      <div className="profile-review-summary-stars" aria-hidden>
        {singleStar ? (
          <Star
            className="h-4 w-4 text-[var(--indigo)]"
            fill="currentColor"
            strokeWidth={1.5}
          />
        ) : (
          Array.from({ length: 5 }, (_, index) => {
            const filled = index + 1 <= Math.round(rating);
            return (
              <Star
                key={index}
                className={`h-4 w-4 ${filled ? "text-[var(--indigo)]" : "text-[var(--muted-dim)]"}`}
                fill={filled ? "currentColor" : "none"}
                strokeWidth={1.5}
              />
            );
          })
        )}
      </div>
      <p className="profile-review-summary-text">
        {rating.toFixed(1)}
        {countSuffix}
      </p>
    </div>
  );
}
