"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  deleteListing,
  updateListingStatus,
  type ListingStatus,
} from "@/app/auth/actions";
import { getListingEditHref } from "@/lib/types";

import type { CommissionType } from "@/lib/types";
import { formatCommission } from "@/lib/types";

export type DashboardListing = {
  id: string;
  intent: "sell" | "buy";
  title: string;
  category: string;
  status: string;
  created_at: string;
  commission_type?: CommissionType;
  commission_value?: number | null;
  price?: number | null;
  is_free?: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  paused: "En pause",
  sold: "Vendue",
  found: "Trouvée",
  closed: "Fermée",
};

const SELL_STATUSES = ["active", "paused", "sold", "closed"] as const;
const BUY_STATUSES = ["active", "paused", "found", "closed"] as const;

function formatListingAmount(listing: DashboardListing) {
  if (listing.intent === "sell") {
    return formatCommission(listing.commission_type, listing.commission_value);
  }
  if (listing.is_free) return "Budget flexible";
  if (listing.price === null || listing.price === undefined) return "—";
  return `CHF ${listing.price}`;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function ListingRow({ listing }: { listing: DashboardListing }) {
  const [pending, startTransition] = useTransition();
  const statuses = listing.intent === "sell" ? SELL_STATUSES : BUY_STATUSES;
  const editHref = getListingEditHref(listing.id, listing.intent);

  function handleStatusChange(status: ListingStatus) {
    startTransition(async () => {
      await updateListingStatus(listing.id, listing.intent, status);
    });
  }

  function handleDelete() {
    if (!confirm("Supprimer cette annonce ?")) return;
    startTransition(async () => {
      await deleteListing(listing.id, listing.intent);
    });
  }

  return (
    <article className="dashboard-listing-row">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--muted)]">{listing.category}</span>
        </div>
        <h3 className="mt-1 truncate text-sm font-medium text-[var(--foreground)]">
          {listing.title}
        </h3>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {formatListingAmount(listing)} · {formatDate(listing.created_at)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={listing.status}
          onChange={(event) =>
            handleStatusChange(event.target.value as ListingStatus)
          }
          disabled={pending}
          className="dashboard-select"
          aria-label="Statut de l'annonce"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <Link href={editHref} className="dashboard-action-btn dashboard-edit-btn">
            Modifier
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="dashboard-action-btn dashboard-delete-btn"
          >
            Supprimer
          </button>
        </div>
      </div>
    </article>
  );
}
