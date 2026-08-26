"use client";

import { useState } from "react";

const DESCRIPTION_TRUNCATE_LENGTH = 220;

type ListingDescriptionProps = {
  description: string;
};

export function ListingDescription({ description }: ListingDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > DESCRIPTION_TRUNCATE_LENGTH;

  return (
    <div className="mt-5 border-t border-[var(--border)] pt-5">
      <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Description</p>
      <p
        className={`mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]${
          !expanded && isLong ? " line-clamp-4" : ""
        }`}
      >
        {description}
      </p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          {expanded ? "Moins" : "Plus"}
        </button>
      ) : null}
    </div>
  );
}
