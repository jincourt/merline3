export type ListingType = "objet" | "service";

export type ListingSource = "prod" | "buy";

export type ConvSource = ListingSource | "profile";

export type ListingStatus = "active" | "paused" | "sold" | "closed" | "found";

export type CommissionType = "chf" | "percent";

export type PriceType = "fixed" | "average" | "hourly";

export const VALID_COMMISSION_TYPES: CommissionType[] = ["chf", "percent"];

export const VALID_PRICE_TYPES: PriceType[] = ["fixed", "average", "hourly"];

export const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  fixed: "Prix fixe",
  average: "Prix moyen",
  hourly: "Taux horaire",
};

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
  session_views?: number;
  favorite_count?: number;
};

export type Product = ListingFields & {
  id: string;
  status: ListingStatus;
  user_id: string | null;
  created_at: string;
  commission_type: CommissionType;
  commission_value: number;
  price: number | null;
  price_type: PriceType | null;
  session_views?: number;
  favorite_count?: number;
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
  "Véhicule",
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
  price_type?: PriceType | null;
  is_free: boolean;
  address: string;
  photos: string[];
  created_at: string;
  ownerName?: string;
  ownerUsername?: string;
  ownerAvatarUrl?: string;
  ownerAverageRating?: number | null;
  ownerReviewCount?: number;
  session_views?: number;
  favorite_count?: number;
};

function formatChfAmount(value: number) {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCommission(
  commissionType: CommissionType | null | undefined,
  commissionValue: number | null | undefined,
) {
  if (commissionValue === null || commissionValue === undefined) return "—";
  if (commissionType === "percent") {
    return `${Number.isInteger(commissionValue) ? commissionValue : commissionValue.toString().replace(".", ",")}%`;
  }
  return formatChfAmount(commissionValue);
}

export function formatSalePrice(price: number | null | undefined) {
  if (price === null || price === undefined) return "—";
  return formatChfAmount(price);
}

export function isValidPriceType(value: string): value is PriceType {
  return VALID_PRICE_TYPES.includes(value as PriceType);
}

export function getAvailablePriceTypes(
  commissionType: CommissionType,
  listingType: ListingType,
): PriceType[] {
  if (commissionType === "percent") {
    return listingType === "service" ? ["average", "hourly"] : ["average"];
  }
  if (listingType === "service") return ["fixed", "hourly"];
  return ["fixed"];
}

export function resolvePriceType(
  priceType: PriceType | null | undefined,
  commissionType: CommissionType,
  listingType: ListingType,
): PriceType {
  const available = getAvailablePriceTypes(commissionType, listingType);
  if (priceType && available.includes(priceType)) return priceType;
  return available[0];
}

export function getSalePriceLabel(
  commissionType: CommissionType | null | undefined,
  priceType?: PriceType | null,
) {
  if (priceType && priceType in PRICE_TYPE_LABELS) {
    return PRICE_TYPE_LABELS[priceType];
  }
  if (commissionType === "percent") return PRICE_TYPE_LABELS.average;
  return PRICE_TYPE_LABELS.fixed;
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
  price_type?: PriceType | null;
  is_free?: boolean;
};
