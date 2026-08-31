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
    <div className="listing-description">
      <h2 className="listing-section-label">Description</h2>
      <p
        className={`listing-description-text${
          !expanded && isLong ? " line-clamp-4" : ""
        }`}
      >
        {description}
      </p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="listing-description-toggle"
        >
          {expanded ? "Moins" : "Plus"}
        </button>
      ) : null}
    </div>
  );
}
