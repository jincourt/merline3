"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HeaderIcon, PlusIcon } from "@/components/layout/HeaderIcons";
import { ListingRow, type DashboardListing } from "@/components/listings/ListingRow";
import { SelectDropdown } from "@/components/ui/SelectDropdown";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "paused", label: "En pause" },
  { value: "sold", label: "Vendue" },
  { value: "closed", label: "Fermée" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Plus récent" },
  { value: "oldest", label: "Plus anciennes" },
  { value: "price_desc", label: "Plus chères" },
  { value: "price_asc", label: "Moins chères" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"] | "";

function getSortAmount(listing: DashboardListing) {
  return listing.commission_value ?? 0;
}

function filterAndSortListings(
  listings: DashboardListing[],
  query: string,
  status: string,
  sort: SortValue,
) {
  const normalizedQuery = query.trim().toLowerCase();
  const effectiveSort = sort || "newest";

  let result = listings.filter((listing) => {
    if (status && listing.status !== status) return false;
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

export function DashboardListingsPanel({ listings }: { listings: DashboardListing[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<SortValue>("");

  const filteredListings = useMemo(
    () => filterAndSortListings(listings, query, status, sort),
    [listings, query, status, sort],
  );

  return (
    <>
      <div className="dashboard-listings-toolbar">
        <input
          id="dashboard-listings-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher"
          className="field-input dashboard-listings-search"
          aria-label="Rechercher"
        />

        <div className="dashboard-listings-filters">
          <SelectDropdown
            id="dashboard-listings-status"
            value={status}
            onChange={setStatus}
            options={[...STATUS_OPTIONS]}
            placeholder="Status"
            className="dashboard-listings-filter"
          />
          <SelectDropdown
            id="dashboard-listings-sort"
            value={sort}
            onChange={(value) => setSort(value as SortValue)}
            options={[...SORT_OPTIONS]}
            placeholder="Trier"
            className="dashboard-listings-filter"
          />
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="dashboard-empty">
          <p className="text-sm text-[var(--muted)]">
            Vous n&apos;avez pas encore d&apos;annonce.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/vendre" className="btn-primary header-publish-btn">
              <HeaderIcon className="h-4 w-4">
                <PlusIcon />
              </HeaderIcon>
              Publier une annonce
            </Link>
          </div>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="dashboard-empty">
          <p className="text-sm text-[var(--muted)]">Aucune annonce ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-2.5">
          {filteredListings.map((listing) => (
            <ListingRow key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </>
  );
}
