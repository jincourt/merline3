import {
  formatReviewDate,
  type ProfileReviewSummary,
} from "@/lib/profile-reviews";
import { Star } from "lucide-react";

type ProfileReviewsSectionProps = {
  summary: ProfileReviewSummary;
  title?: string;
  stacked?: boolean;
};

export function ProfileReviewsSection({
  summary,
  title = "Avis",
  stacked = false,
}: ProfileReviewsSectionProps) {
  return (
    <section className={`profile-reviews-section ${stacked ? "profile-reviews-section-stacked" : ""}`.trim()}>
      <div className={stacked ? "profile-reviews-header-stacked" : "profile-reviews-header"}>
        <h2 className={stacked ? "section-subtitle" : "section-title"}>{title}</h2>
      </div>

      {summary.reviews.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          Aucun avis pour le moment.
        </p>
      ) : (
        <ul className="profile-reviews-list">
          {summary.reviews.map((review) => (
            <li key={review.id} className="profile-review-item">
              <div className="profile-review-item-head">
                <p className="profile-review-author">{review.reviewerName}</p>
                <time className="profile-review-date" dateTime={review.createdAt}>
                  {formatReviewDate(review.createdAt)}
                </time>
              </div>
              <div className="profile-review-item-stars" aria-label={`${review.rating} sur 5`}>
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className={`h-3.5 w-3.5 ${
                      index + 1 <= review.rating
                        ? "text-[var(--indigo)]"
                        : "text-[var(--muted-dim)]"
                    }`}
                    fill={index + 1 <= review.rating ? "currentColor" : "none"}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                ))}
              </div>
              {review.comment ? (
                <p className="profile-review-comment">{review.comment}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
