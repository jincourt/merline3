export type ListingType = "objet" | "service";

export type ListingSource = "prod" | "buy";

export type ConvSource = ListingSource | "profile";

export type ListingStatus = "active" | "paused" | "sold" | "closed" | "found";

export type CommissionType = "chf" | "percent";

export const VALID_COMMISSION_TYPES: CommissionType[] = ["chf", "percent"];

export type ListingFields = {
  listing_type: ListingType;
  category: string;
  title: string;
  description: string;
  address: string;
  email: string | null;
  photos: string[];
};

export type BuyRequest = ListingFields & {
  id: string;
  status: ListingStatus;
  user_id: string | null;
  created_at: string;
  price: number | null;
  is_free: boolean;
};

export type Product = ListingFields & {
  id: string;
  status: ListingStatus;
  user_id: string | null;
  created_at: string;
  commission_type: CommissionType;
  commission_value: number;
};

export const LISTING_TYPES = [
  { value: "objet", label: "Objet" },
  { value: "service", label: "Service" },
] as const;

export const VALID_LISTING_TYPES: ListingType[] = ["objet", "service"];

export const OBJECT_CATEGORIES = [
  "Meubles",
  "Électronique",
  "Vêtements",
  "Livres",
  "Art & Déco",
  "Sport",
  "Personnalisé",
] as const;

export const SERVICE_CATEGORIES = [
  "Réparation & Bricolage",
  "Beauté & Bien-être",
  "Informatique & Tech",
  "Ménage & Entretien",
  "Transport & Déménagement",
  "Événementiel",
  "Personnalisé",
] as const;

/** @deprecated Use OBJECT_CATEGORIES or SERVICE_CATEGORIES */
export const CATEGORIES = OBJECT_CATEGORIES;

export type ObjectCategory = (typeof OBJECT_CATEGORIES)[number];
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export function getCategoriesForType(type: ListingType): readonly string[] {
  return type === "service" ? SERVICE_CATEGORIES : OBJECT_CATEGORIES;
}

export function normalizeListingType(value: string | undefined): ListingType {
  return value === "service" ? "service" : "objet";
}

export function getListingTypeLabel(type: ListingType): string {
  return LISTING_TYPES.find((item) => item.value === type)?.label ?? type;
}

export function isPhysicalListingType(type: ListingType): boolean {
  return type === "objet";
}

export type ListingIntent = "sell" | "buy";

export type CatalogListing = {
  id: string;
  intent: ListingIntent;
  listing_type: ListingType;
  category: string;
  title: string;
  description: string;
  commission_type: CommissionType | null;
  commission_value: number | null;
  price: number | null;
  is_free: boolean;
  address: string;
  photos: string[];
  created_at: string;
  ownerName?: string;
  ownerUsername?: string;
  ownerAvatarUrl?: string;
  ownerAverageRating?: number | null;
  ownerReviewCount?: number;
};

export function formatCommission(
  commissionType: CommissionType | null | undefined,
  commissionValue: number | null | undefined,
) {
  if (commissionValue === null || commissionValue === undefined) return "—";
  if (commissionType === "percent") {
    return `${Number.isInteger(commissionValue) ? commissionValue : commissionValue.toString().replace(".", ",")}%`;
  }
  const formatted = new Intl.NumberFormat("fr-CH", {
    maximumFractionDigits: 0,
  }).format(commissionValue);
  return `CHF ${formatted}.-`;
}

export function intentToSource(intent: ListingIntent): ListingSource {
  return intent === "sell" ? "prod" : "buy";
}

export function sourceToIntent(source: ListingSource): ListingIntent {
  return source === "prod" ? "sell" : "buy";
}

export function getListingHref(
  id: string,
  intent: ListingIntent | ListingSource,
): string {
  const src = intent === "sell" || intent === "buy" ? intentToSource(intent) : intent;
  return `/annonce/${src}/${id}`;
}

export function getListingEditHref(id: string, intent: ListingIntent): string {
  return `/dashboard/annonces/${intent}/${id}/modifier`;
}

export type EditListingData = ListingFields & {
  id: string;
  commission_type?: CommissionType;
  commission_value?: number | null;
  price?: number | null;
  is_free?: boolean;
};
