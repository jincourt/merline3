"use client";

import Link from "next/link";
import Image from "next/image";
import { useTransition } from "react";
import { updateListingStatus } from "@/app/auth/actions";
import { ListingDeleteButton } from "@/components/listings/ListingDeleteButton";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import {
  getListingEditHref,
  getListingHref,
  type CommissionType,
  type ListingStatus,
} from "@/lib/types";

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
  address?: string;
  photos?: string[];
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  pending_payment: "Paiement",
  active: "Active",
  paused: "En pause",
  sold: "Vendue",
  found: "Trouvée",
  closed: "Fermée",
};

const STATUS_BADGE_LABELS: Record<string, string> = {
  ...STATUS_LABELS,
  pending_payment: "Paiement en attente",
};

const SELL_STATUSES = ["active", "paused", "sold", "closed"] as const;
const BUY_STATUSES = ["active", "paused", "found", "closed"] as const;

export function DashboardListingCard({
  listing,
}: {
  listing: DashboardListing;
}) {
  const [pending, startTransition] = useTransition();
  const statuses = listing.intent === "sell" ? SELL_STATUSES : BUY_STATUSES;
  const statusOptions = statuses.map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  }));
  const editHref = getListingEditHref(listing.id, listing.intent);
  const listingHref = getListingHref(listing.id, listing.intent);
  const image = listing.photos?.find((photo) => photo?.startsWith("http"));

  const isIncomplete =
    listing.intent === "sell" &&
    (listing.status === "draft" || listing.status === "pending_payment");
  const finalizeHref =
    listing.status === "pending_payment"
      ? `/vendre/paiement?listing=${listing.id}`
      : `/vendre/plan?listing=${listing.id}`;
  const openHref = isIncomplete ? finalizeHref : listingHref;
  const statusLabel = STATUS_BADGE_LABELS[listing.status] ?? listing.status;

  function handleStatusChange(status: ListingStatus) {
    startTransition(async () => {
      await updateListingStatus(listing.id, listing.intent, status);
    });
  }

  return (
    <li className="dashboard-listings-item">
      <div className="dashboard-listing-row">
        <div className="dashboard-listing-row-main">
          <Link href={openHref} className="dashboard-listing-row-thumb-link">
            <div className="dashboard-listing-row-thumb">
              {image ? (
                <Image
                  src={image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="3rem"
                />
              ) : (
                <span className="dashboard-listing-row-thumb-empty" aria-hidden>
                  —
                </span>
              )}
            </div>
          </Link>

          <div className="dashboard-listing-row-copy">
            <Link href={openHref} className="dashboard-listing-row-title-link">
              <span className="dashboard-listing-row-title">{listing.title}</span>
            </Link>
          </div>
        </div>

        <div className="dashboard-listing-row-status">
          {isIncomplete ? (
            <span
              className="dashboard-listing-status-badge"
              aria-label={`Statut : ${statusLabel}`}
            >
              {statusLabel}
            </span>
          ) : (
            <SelectDropdown
              id={`listing-status-${listing.id}`}
              value={listing.status}
              onChange={(value) => handleStatusChange(value as ListingStatus)}
              options={statusOptions}
              placeholder="Statut"
              disabled={pending}
              className="catalog-toolbar-select dashboard-listing-status-select"
              active={Boolean(listing.status)}
              mobileBehavior="dialog"
              portalPanel
              panelAlign="start"
            />
          )}
        </div>

        <div className="dashboard-listing-row-actions">
          {isIncomplete ? (
            <Link href={finalizeHref} className="dashboard-listing-row-action">
              Finaliser
            </Link>
          ) : (
            <Link href={editHref} className="dashboard-listing-row-action">
              Modifier
            </Link>
          )}
          {isIncomplete ? (
            <ListingDeleteButton
              listingId={listing.id}
              intent={listing.intent}
              title={listing.title}
              variant="icon"
              redirectAfterDelete={false}
            />
          ) : null}
        </div>
      </div>
    </li>
  );
}
