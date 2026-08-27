"use client";

import { useEffect, useMemo, useState } from "react";
import type { CatalogListing } from "@/lib/types";
import {
  DEFAULT_CATALOG_FILTERS,
  filterCatalogListings,
  getCatalogCategories,
  type CatalogFilters,
} from "@/lib/catalog";
import { CatalogCard } from "./CatalogCard";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { MotionDiv } from "@/components/ui/motion";

type CatalogBrowserProps = {
  listings: CatalogListing[];
  showSearch?: boolean;
  pageSize?: number;
  layout?: "list" | "grid";
};

const TYPE_OPTIONS = [
  { value: "objet", label: "Objet" },
  { value: "service", label: "Service" },
] as const;

export function CatalogBrowser({
  listings,
  showSearch = true,
  pageSize,
  layout = "list",
}: CatalogBrowserProps) {
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_CATALOG_FILTERS);
  const [page, setPage] = useState(0);
  const categories = useMemo(() => getCatalogCategories(listings), [listings]);

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "Toutes les catégories" },
      ...categories.map((category) => ({ value: category, label: category })),
    ],
    [categories],
  );

  const filtered = useMemo(
    () => filterCatalogListings(listings, filters),
    [listings, filters],
  );

  useEffect(() => {
    setPage(0);
  }, [filters]);

  const visible = pageSize
    ? filtered.slice(page * pageSize, (page + 1) * pageSize)
    : filtered;

  const hasMore = pageSize ? (page + 1) * pageSize < filtered.length : false;

  function updateFilter<K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function toggleFilter(
    key: "listingType",
    value: NonNullable<CatalogFilters["listingType"]>,
  ) {
    setFilters((current) => ({
      ...current,
      [key]: current[key] === value ? null : value,
    }));
  }

  return (
    <div className="space-y-6">
      <MotionDiv className="space-y-6">
        {showSearch ? (
          <div className="catalog-search">
            <label htmlFor="catalog-search" className="section-title">
              Rechercher une commission
            </label>
            <input
              id="catalog-search"
              type="search"
              value={filters.q}
              onChange={(event) => updateFilter("q", event.target.value)}
              placeholder="Titre, catégorie, description, lieu…"
              className="field-input mt-4"
            />
          </div>
        ) : null}

        <div className="catalog-filters-2col">
          <div className="catalog-filter-col">
            <SelectDropdown
              id="catalog-category"
              label="Catégorie"
              labelClassName="section-subtitle"
              labelSpacing="lg"
              value={filters.category}
              onChange={(value) => updateFilter("category", value)}
              options={categoryOptions}
              placeholder="Toutes les catégories"
            />
          </div>

          <div className="catalog-filter-col">
            <p className="section-subtitle">Type</p>
            <div className="catalog-filter-grid mt-4">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`catalog-filter-pill catalog-filter-pill-lg ${
                    filters.listingType === option.value ? "catalog-filter-pill-active" : ""
                  }`}
                  onClick={() => toggleFilter("listingType", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </MotionDiv>

      <p className="section-subtitle">
        {filtered.length} annonce{filtered.length > 1 ? "s" : ""}
      </p>

      {visible.length === 0 ? (
        <div className="border border-dashed border-[var(--border-strong)] p-12 text-center">
          <p className="text-sm text-[var(--muted)]">
            Aucune annonce ne correspond à vos filtres.
          </p>
        </div>
      ) : (
        <div
          className={
            layout === "grid"
              ? "grid grid-cols-2 gap-4 lg:grid-cols-3"
              : "flex flex-col gap-4"
          }
        >
          {visible.map((listing, index) => (
            <CatalogCard
              key={`${listing.intent}-${listing.id}`}
              listing={listing}
              delay={index * 0.05}
              variant={layout}
            />
          ))}
        </div>
      )}

      {hasMore ? (
        <div className="pt-2">
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
