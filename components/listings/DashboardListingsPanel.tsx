"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HeaderIcon, PlusIcon } from "@/components/layout/HeaderIcons";
import {
  DashboardListingCard,
  type DashboardListing,
} from "@/components/listings/DashboardListingCard";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { MotionDiv } from "@/components/ui/motion";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "paused", label: "En pause" },
  { value: "draft", label: "Brouillon" },
  { value: "pending_payment", label: "Paiement en attente" },
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
    <div className="dashboard-listings-grid">
      <MotionDiv delay={0.06} className="dashboard-listings-toolbar">
        <div className="dashboard-listings-toolbar-leading">
          <input
            id="dashboard-listings-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une annonce"
            className="field-input catalog-search-input dashboard-listings-search"
            aria-label="Rechercher"
          />
        </div>

        <div className="dashboard-listings-toolbar-status">
          <SelectDropdown
            id="dashboard-listings-status"
            value={status}
            onChange={setStatus}
            options={[...STATUS_OPTIONS]}
            placeholder="Statut"
            className="catalog-toolbar-select dashboard-listings-filter"
            active={Boolean(status)}
            mobileBehavior="inline"
          />
        </div>

        <div className="dashboard-listings-toolbar-sort">
          <SelectDropdown
            id="dashboard-listings-sort"
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
          <p className="messages-empty-title">Aucune annonce</p>
          <p className="messages-empty-desc">
            Publiez votre première annonce pour la rendre visible aux agents.
          </p>
          <Link href="/vendre" className="btn-primary header-publish-btn dashboard-listings-empty-cta">
            <HeaderIcon className="h-4 w-4">
              <PlusIcon />
            </HeaderIcon>
            Publier une annonce
          </Link>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="messages-empty dashboard-listings-empty">
          <p className="messages-empty-title">Aucun résultat</p>
          <p className="messages-empty-desc">
            Aucune annonce ne correspond à votre recherche.
          </p>
        </div>
      ) : (
        <div className="dashboard-listings-list">
          {filteredListings.map((listing, index) => (
            <DashboardListingCard
              key={listing.id}
              listing={listing}
              delay={index * 0.04}
            />
          ))}
        </div>
      )}
    </div>
  );
}
