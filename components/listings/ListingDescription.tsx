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
    <section className="listing-description public-profile-section form-stripe-section">
      <h2 className="public-profile-section-title">Description</h2>
      <p
        className={`public-profile-description listing-description-text${
          !expanded && isLong ? " line-clamp-4" : ""
        }`}
      >
        {description}
      </p>
      {isLong ? (
        <div className="listing-description-actions">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="public-profile-section-action listing-description-toggle"
          >
            {expanded ? "Moins" : "Plus"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
