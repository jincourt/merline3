"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  deleteListing,
  updateListingStatus,
  type ListingStatus,
} from "@/app/auth/actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { getListingEditHref, getListingHref } from "@/lib/types";

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
  photos?: string[];
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  pending_payment: "Paiement en attente",
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const statuses = listing.intent === "sell" ? SELL_STATUSES : BUY_STATUSES;
  const statusOptions = statuses.map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  }));
  const editHref = getListingEditHref(listing.id, listing.intent);
  const listingHref = getListingHref(listing.id, listing.intent);
  const image = listing.photos?.find((photo) => photo?.startsWith("http"));

  function handleStatusChange(status: ListingStatus) {
    startTransition(async () => {
      await updateListingStatus(listing.id, listing.intent, status);
    });
  }

  function handleDeleteConfirm() {
    startTransition(async () => {
      await deleteListing(listing.id, listing.intent);
      setDeleteDialogOpen(false);
    });
  }

  const isIncomplete =
    listing.intent === "sell" &&
    (listing.status === "draft" || listing.status === "pending_payment");
  const finalizeHref =
    listing.status === "pending_payment"
      ? `/vendre/paiement?listing=${listing.id}`
      : `/vendre/plan?listing=${listing.id}`;

  return (
    <>
      <article className="dashboard-listing-row">
      {isIncomplete ? (
        <div className="dashboard-listing-link">
          <div className="dashboard-listing-thumb">
            {image ? (
              <Image
                src={image}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <span className="dashboard-listing-thumb-empty">Aucune image</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--muted)]">{listing.category}</span>
              <span className="text-xs font-medium text-[var(--indigo)]">
                {STATUS_LABELS[listing.status]}
              </span>
            </div>
            <h3 className="mt-1 truncate text-sm font-medium text-[var(--foreground)]">
              {listing.title}
            </h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {formatListingAmount(listing)} · {formatDate(listing.created_at)}
            </p>
          </div>
        </div>
      ) : (
      <Link href={listingHref} className="dashboard-listing-link">
        <div className="dashboard-listing-thumb">
          {image ? (
            <Image
              src={image}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <span className="dashboard-listing-thumb-empty">Aucune image</span>
          )}
        </div>

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
      </Link>
      )}

      <div className="dashboard-listing-actions">
        {isIncomplete ? (
          <div className="dashboard-listing-action-btns">
            <Link href={finalizeHref} className="dashboard-action-btn dashboard-edit-btn">
              Finaliser
            </Link>
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={pending}
              className="dashboard-action-btn dashboard-delete-btn dashboard-delete-btn-icon"
              aria-label="Supprimer l'annonce"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        ) : (
        <>
        <SelectDropdown
          id={`listing-status-${listing.id}`}
          value={listing.status}
          onChange={(value) => handleStatusChange(value as ListingStatus)}
          options={statusOptions}
          placeholder="Statut"
          size="compact"
          disabled={pending}
        />

        <div className="dashboard-listing-action-btns">
          <Link href={editHref} className="dashboard-action-btn dashboard-edit-btn">
            Modifier
          </Link>
          <Link href={listingHref} className="dashboard-action-btn dashboard-edit-btn">
            Ouvrir
          </Link>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={pending}
            className="dashboard-action-btn dashboard-delete-btn dashboard-delete-btn-icon"
            aria-label="Supprimer l'annonce"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        </>
        )}
      </div>
      </article>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer cette annonce ?"
        description={`« ${listing.title} » sera définitivement supprimée. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        pending={pending}
        pendingLabel="Suppression…"
        destructive
      />
    </>
  );
}
