import { Heart } from "lucide-react";
import { formatCompactNumber, formatFavoriteCount } from "@/lib/analytics";

export function FavoriteCount({
  count = 0,
  showLabel = false,
  className = "",
}: {
  count?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const safe = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;

  return (
    <span
      className={`listing-favorite-count ${className}`.trim()}
      aria-label={showLabel ? undefined : `${safe} favori${safe === 1 ? "" : "s"}`}
    >
      <Heart className="listing-favorite-count-icon" strokeWidth={1.75} aria-hidden />
      <span aria-hidden={!showLabel}>
        {showLabel ? formatFavoriteCount(safe) : formatCompactNumber(safe)}
      </span>
    </span>
  );
}
