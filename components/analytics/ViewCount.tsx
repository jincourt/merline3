import { Eye } from "lucide-react";
import { formatCompactNumber, formatViewCount } from "@/lib/analytics";

export function ViewCount({
  count = 0,
  showLabel = true,
  className = "",
}: {
  count?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const safe = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;

  return (
    <span
      className={`listing-view-count ${className}`.trim()}
      aria-label={showLabel ? undefined : `${safe} vue${safe === 1 ? "" : "s"}`}
    >
      <Eye className="listing-view-count-icon" strokeWidth={1.75} aria-hidden />
      <span aria-hidden={!showLabel}>
        {showLabel ? formatViewCount(safe) : formatCompactNumber(safe)}
      </span>
    </span>
  );
}
