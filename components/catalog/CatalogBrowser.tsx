"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CatalogListing } from "@/lib/types";
import {
  DEFAULT_CATALOG_FILTERS,
  filterCatalogListings,
  filtersFromSearchParams,
  getCatalogCategories,
  sortCatalogListings,
  type CatalogFilters,
  type CatalogSort,
} from "@/lib/catalog";
import { CatalogCard } from "./CatalogCard";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { RangeFilterDropdown } from "@/components/ui/RangeFilterDropdown";
import { MotionDiv } from "@/components/ui/motion";

type CatalogBrowserProps = {
  listings: CatalogListing[];
  showSearch?: boolean;
  pageSize?: number;
  layout?: "list" | "grid";
};

const TYPE_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "objet", label: "Objet" },
  { value: "service", label: "Service" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Plus récent" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "commission-asc", label: "Commission croissante" },
  { value: "commission-desc", label: "Commission décroissante" },
] as const;

export function CatalogBrowser({
  listings,
  showSearch = true,
  pageSize,
  layout = "list",
}: CatalogBrowserProps) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CatalogFilters>(() => ({
    ...DEFAULT_CATALOG_FILTERS,
    ...filtersFromSearchParams(searchParams),
  }));
  const [page, setPage] = useState(0);
  const categories = useMemo(() => getCatalogCategories(listings), [listings]);

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "Toutes les catégories" },
      ...categories.map((category) => ({ value: category, label: category })),
    ],
    [categories],
  );

  const filtered = useMemo(() => {
    const next = filterCatalogListings(listings, filters);
    return sortCatalogListings(next, filters.sort);
  }, [listings, filters]);

  useEffect(() => {
    setPage(0);
  }, [filters]);

  const visible = pageSize
    ? filtered.slice(page * pageSize, (page + 1) * pageSize)
    : filtered;

  const hasMore = pageSize ? (page + 1) * pageSize < filtered.length : false;

  const salePriceValues = useMemo(
    () =>
      listings
        .filter((listing) => listing.price !== null && listing.price > 0)
        .map((listing) => listing.price as number),
    [listings],
  );

  const commissionValues = useMemo(
    () =>
      listings
        .filter(
          (listing) =>
            listing.intent === "sell" &&
            listing.commission_value !== null &&
            listing.commission_value > 0 &&
            listing.commission_type !== "percent",
        )
        .map((listing) => listing.commission_value as number),
    [listings],
  );

  function updateFilter<K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="catalog-browser">
      <MotionDiv className="catalog-browser-head">
        {showSearch ? (
          <div className="catalog-search">
            <label htmlFor="catalog-search" className="sr-only">
              Rechercher dans le catalogue
            </label>
            <input
              id="catalog-search"
              type="search"
              value={filters.q}
              onChange={(event) => updateFilter("q", event.target.value)}
              placeholder="Titre, catégorie, description, lieu…"
              className="field-input catalog-search-input"
            />
          </div>
        ) : null}

        <div className="catalog-toolbar">
          <div
            className="catalog-segment"
            role="group"
            aria-label="Type d'annonce"
          >
            {TYPE_OPTIONS.map((option) => {
              const isActive =
                option.value === ""
                  ? filters.listingType === null
                  : filters.listingType === option.value;

              return (
                <button
                  key={option.value || "all"}
                  type="button"
                  className={`catalog-segment-btn ${
                    isActive ? "catalog-segment-btn-active" : ""
                  }`}
                  onClick={() =>
                    updateFilter(
                      "listingType",
                      option.value === ""
                        ? null
                        : option.value,
                    )
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="catalog-toolbar-controls">
            <SelectDropdown
              id="catalog-category"
              value={filters.category}
              onChange={(value) => updateFilter("category", value)}
              options={categoryOptions}
              placeholder="Catégorie"
              className="catalog-toolbar-select catalog-toolbar-select-wide"
              active={filters.category !== ""}
              mobileBehavior="inline"
            />

            <RangeFilterDropdown
              id="catalog-price"
              label="Prix"
              minValue={filters.salePriceMin}
              maxValue={filters.salePriceMax}
              onMinChange={(value) => updateFilter("salePriceMin", value)}
              onMaxChange={(value) => updateFilter("salePriceMax", value)}
              distributionValues={salePriceValues}
              suffix="CHF"
              className="catalog-toolbar-range"
            />

            <RangeFilterDropdown
              id="catalog-commission"
              label="Commission"
              minValue={filters.commissionMin}
              maxValue={filters.commissionMax}
              onMinChange={(value) => updateFilter("commissionMin", value)}
              onMaxChange={(value) => updateFilter("commissionMax", value)}
              distributionValues={commissionValues}
              suffix="CHF"
              className="catalog-toolbar-range"
            />

            <SelectDropdown
              id="catalog-sort"
              value={filters.sort || "newest"}
              onChange={(value) => updateFilter("sort", value as CatalogSort)}
              options={[...SORT_OPTIONS]}
              placeholder="Trier"
              className="catalog-toolbar-select"
              active={(filters.sort || "newest") !== "newest"}
              mobileBehavior="inline"
            />
          </div>
        </div>
      </MotionDiv>

      {visible.length === 0 ? (
        <div className="catalog-empty">
          <p>Aucune annonce ne correspond à vos filtres.</p>
        </div>
      ) : (
        <div className={layout === "grid" ? "catalog-grid" : "catalog-list"}>
          {visible.map((listing, index) => (
            <CatalogCard
              key={`${listing.intent}-${listing.id}`}
              listing={listing}
              delay={index * 0.04}
              variant={layout}
            />
          ))}
        </div>
      )}

      {hasMore ? (
        <div className="catalog-more">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setPage((current) => current + 1)}
          >
            Afficher plus
          </button>
        </div>
      ) : null}
    </div>
  );
}
