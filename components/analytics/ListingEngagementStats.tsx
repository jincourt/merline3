import { ViewCount } from "@/components/analytics/ViewCount";
import { FavoriteCount } from "@/components/analytics/FavoriteCount";

export function ListingEngagementStats({
  views = 0,
  favorites = 0,
  variant = "catalog",
  className = "",
}: {
  views?: number;
  favorites?: number;
  variant?: "catalog" | "listing";
  className?: string;
}) {
  const isListing = variant === "listing";

  return (
    <div className={`listing-engagement-stats ${className}`.trim()}>
      <ViewCount count={views} showLabel={isListing} />
      <FavoriteCount count={favorites} showLabel={isListing} />
    </div>
  );
}
