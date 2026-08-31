"use client";

import Link from "next/link";
import Image from "next/image";
import { useTransition } from "react";
import {
  updateListingStatus,
  type ListingStatus,
} from "@/app/auth/actions";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { MotionArticle } from "@/components/ui/motion";
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
  address?: string;
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

function ListingStatusStatic({ status }: { status: string }) {
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span className="dashboard-listing-status-static" aria-label={`Statut : ${label}`}>
      {label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function ListingMedia({
  image,
  title,
  href,
}: {
  image?: string;
  title: string;
  href: string;
}) {
  return (
    <Link href={href} className="dashboard-listing-card-media">
      <div className="catalog-card-image">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 40vw, 15rem"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs text-[var(--muted-dim)]">Aucune image</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function DashboardListingCard({
  listing,
  delay = 0,
}: {
  listing: DashboardListing;
  delay?: number;
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
  const amount = formatListingAmount(listing);
  const date = formatDate(listing.created_at);

  const isIncomplete =
    listing.intent === "sell" &&
    (listing.status === "draft" || listing.status === "pending_payment");
  const finalizeHref =
    listing.status === "pending_payment"
      ? `/vendre/paiement?listing=${listing.id}`
      : `/vendre/plan?listing=${listing.id}`;
  const openHref = isIncomplete ? finalizeHref : listingHref;

  function handleStatusChange(status: ListingStatus) {
    startTransition(async () => {
      await updateListingStatus(listing.id, listing.intent, status);
    });
  }

  const titleContent = (
    <h3 className="catalog-card-title catalog-card-profile-title">{listing.title}</h3>
  );

  return (
    <MotionArticle delay={delay} hoverLift={false}>
      <article className="dashboard-listing-card">
        <div className="dashboard-listing-card-layout">
          <ListingMedia image={image} title={listing.title} href={openHref} />

          <div className="dashboard-listing-card-body">
            <div className="dashboard-listing-card-copy">
              <Link href={openHref} className="dashboard-listing-card-title-link">
                {titleContent}
              </Link>

              {listing.category?.trim() ? (
                <span className="catalog-card-profile-tag">{listing.category}</span>
              ) : null}

              <div className="dashboard-listing-card-meta">
                <p className="catalog-card-finance">
                  <span className="catalog-card-finance-commission">{amount}</span>
                </p>
                {listing.address?.trim() ? (
                  <>
                    <span className="dashboard-listing-card-meta-sep" aria-hidden>
                      ·
                    </span>
                    <p className="catalog-card-location">{listing.address}</p>
                  </>
                ) : (
                  <>
                    <span className="dashboard-listing-card-meta-sep" aria-hidden>
                      ·
                    </span>
                    <p className="catalog-card-location">{date}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-listing-card-status">
            {isIncomplete ? (
              <ListingStatusStatic status={listing.status} />
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
                mobileBehavior="inline"
              />
            )}
          </div>

          <div className="dashboard-listing-card-actions">
            {isIncomplete ? (
              <Link href={finalizeHref} className="dashboard-listing-action-link">
                Finaliser
              </Link>
            ) : (
              <Link href={editHref} className="dashboard-listing-action-link">
                Modifier
              </Link>
            )}
          </div>
        </div>
      </article>
    </MotionArticle>
  );
}
