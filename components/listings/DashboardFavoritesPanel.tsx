"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CatalogCard } from "@/components/catalog/CatalogCard";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { MotionDiv } from "@/components/ui/motion";
import type { CatalogListing } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "newest", label: "Plus récent" },
  { value: "oldest", label: "Plus ancien" },
  { value: "price_desc", label: "Plus chères" },
  { value: "price_asc", label: "Moins chères" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"] | "";

function getSortAmount(listing: CatalogListing) {
  return listing.commission_value ?? listing.price ?? 0;
}

function filterAndSortListings(
  listings: CatalogListing[],
  query: string,
  sort: SortValue,
) {
  const normalizedQuery = query.trim().toLowerCase();
  const effectiveSort = sort || "newest";

  let result = listings.filter((listing) => {
    if (!normalizedQuery) return true;

    return (
      listing.title.toLowerCase().includes(normalizedQuery) ||
      listing.category.toLowerCase().includes(normalizedQuery)
    );
  });

  result = [...result].sort((a, b) => {
    switch (effectiveSort) {
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "price_desc":
        return getSortAmount(b) - getSortAmount(a);
      case "price_asc":
        return getSortAmount(a) - getSortAmount(b);
      case "newest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return result;
}

export function DashboardFavoritesPanel({ listings }: { listings: CatalogListing[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortValue>("");

  const filteredListings = useMemo(
    () => filterAndSortListings(listings, query, sort),
    [listings, query, sort],
  );

  return (
    <div className="dashboard-listings-panel-wrap">
      <MotionDiv delay={0.06} className="dashboard-listings-toolbar">
        <div className="dashboard-listings-toolbar-leading">
          <label htmlFor="dashboard-favorites-search" className="sr-only">
            Rechercher un favori
          </label>
          <input
            id="dashboard-favorites-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un favori"
            className="field-input catalog-search-input dashboard-listings-search"
          />
        </div>

        <div className="dashboard-listings-toolbar-filters dashboard-listings-toolbar-filters-single">
          <SelectDropdown
            id="dashboard-favorites-sort"
            value={sort}
            onChange={(value) => setSort(value as SortValue)}
            options={[...SORT_OPTIONS]}
            placeholder="Trier"
            className="catalog-toolbar-select dashboard-listings-filter"
            active={Boolean(sort) && sort !== "newest"}
            mobileBehavior="inline"
          />
        </div>
      </MotionDiv>

      {listings.length === 0 ? (
        <div className="messages-empty dashboard-listings-empty">
          <p className="messages-empty-title">Aucun favori</p>
          <p className="messages-empty-desc">
            Enregistrez des annonces depuis le catalogue pour les retrouver ici.
          </p>
          <Link
            href="/#catalogue"
            className="dashboard-listings-head-btn dashboard-listings-head-btn-primary dashboard-listings-empty-cta"
          >
            Voir le catalogue
          </Link>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="messages-empty dashboard-listings-empty">
          <p className="messages-empty-title">Aucun résultat</p>
          <p className="messages-empty-desc">
            Aucun favori ne correspond à votre recherche.
          </p>
        </div>
      ) : (
        <div className="catalog-grid dashboard-favorites-grid">
          {filteredListings.map((listing, index) => (
            <CatalogCard
              key={`${listing.intent}-${listing.id}`}
              listing={listing}
              delay={index * 0.04}
              variant="grid"
            />
          ))}
        </div>
      )}
    </div>
  );
}
