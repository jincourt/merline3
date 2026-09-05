import type { BuyRequest, CatalogListing, ListingSource, Product } from "@/lib/types";
import {
  formatCommission,
  formatSalePrice,
  getSalePriceLabel,
  sourceToIntent,
} from "@/lib/types";

export type CatalogSort =
  | ""
  | "newest"
  | "price-asc"
  | "price-desc"
  | "commission-asc"
  | "commission-desc";

export type CatalogFilters = {
  q: string;
  listingType: "objet" | "service" | null;
  category: string;
  sort: CatalogSort;
  commissionMin: string;
  commissionMax: string;
  salePriceMin: string;
  salePriceMax: string;
};

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  q: "",
  listingType: null,
  category: "",
  sort: "",
  commissionMin: "",
  commissionMax: "",
  salePriceMin: "",
  salePriceMax: "",
};

export function buildCatalogHref(
  filters?: Partial<Pick<CatalogFilters, "listingType" | "category">>,
): string {
  const params = new URLSearchParams();
  if (filters?.listingType) {
    params.set("type", filters.listingType);
  }
  if (filters?.category) {
    params.set("category", filters.category);
  }
  const query = params.toString();
  return query ? `/?${query}#catalogue` : "/#catalogue";
}

export function filtersFromSearchParams(
  params: Pick<URLSearchParams, "get">,
): Partial<CatalogFilters> {
  const type = params.get("type");
  const category = params.get("category") ?? "";

  return {
    listingType: type === "objet" || type === "service" ? type : null,
    category,
  };
}

export function toCatalogListing(
  item: Product,
  intent: CatalogListing["intent"],
): CatalogListing {
  return {
    id: item.id,
    intent,
    listing_type: item.listing_type,
    category: item.category,
    title: item.title,
    description: item.description,
    commission_type: item.commission_type,
    commission_value: item.commission_value,
    price: item.price ?? null,
    price_type: item.price_type ?? null,
    is_free: false,
    address: item.address,
    photos: item.photos,
    created_at: item.created_at,
    session_views: item.session_views ?? 0,
    favorite_count: item.favorite_count ?? 0,
  };
}

export function buyRequestToCatalogListing(item: BuyRequest): CatalogListing {
  return {
    id: item.id,
    intent: "buy",
    listing_type: item.listing_type,
    category: item.category,
    title: item.title,
    description: item.description,
    commission_type: null,
    commission_value: null,
    price: item.price,
    is_free: item.is_free,
    address: item.address,
    photos: item.photos,
    created_at: item.created_at,
    session_views: item.session_views ?? 0,
    favorite_count: item.favorite_count ?? 0,
  };
}

export function mergeCatalogListings(products: Product[]): CatalogListing[] {
  return products
    .map((product) => toCatalogListing(product, "sell"))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
}

export function getCatalogCategories(listings: CatalogListing[]): string[] {
  return [...new Set(listings.map((item) => item.category))].sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
}

function getListingSalePrice(item: CatalogListing) {
  return item.price;
}

function getListingCommissionAmount(item: CatalogListing) {
  if (item.intent === "buy") return null;
  return item.commission_value;
}

function compareNullable(
  a: number | null,
  b: number | null,
  direction: "asc" | "desc",
) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return direction === "asc" ? a - b : b - a;
}

export function sortCatalogListings(
  listings: CatalogListing[],
  sort: CatalogSort,
): CatalogListing[] {
  const effective = sort || "newest";

  return [...listings].sort((a, b) => {
    switch (effective) {
      case "price-asc":
        return compareNullable(getListingSalePrice(a), getListingSalePrice(b), "asc");
      case "price-desc":
        return compareNullable(getListingSalePrice(a), getListingSalePrice(b), "desc");
      case "commission-asc":
        return compareNullable(
          getListingCommissionAmount(a),
          getListingCommissionAmount(b),
          "asc",
        );
      case "commission-desc":
        return compareNullable(
          getListingCommissionAmount(a),
          getListingCommissionAmount(b),
          "desc",
        );
      case "newest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
}

export function filterCatalogListings(
  listings: CatalogListing[],
  filters: CatalogFilters,
): CatalogListing[] {
  const query = filters.q.trim().toLowerCase();
  const commissionMin = filters.commissionMin ? Number(filters.commissionMin) : null;
  const commissionMax = filters.commissionMax ? Number(filters.commissionMax) : null;
  const salePriceMin = filters.salePriceMin ? Number(filters.salePriceMin) : null;
  const salePriceMax = filters.salePriceMax ? Number(filters.salePriceMax) : null;

  return listings.filter((item) => {
    if (filters.listingType !== null && item.listing_type !== filters.listingType) {
      return false;
    }

    if (filters.category && item.category !== filters.category) {
      return false;
    }

    if (query) {
      const haystack = [
        item.title,
        item.description,
        item.category,
        item.address,
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(query)) {
        return false;
      }
    }

    if (commissionMin !== null && !Number.isNaN(commissionMin)) {
      if (
        item.commission_value === null ||
        item.commission_value < commissionMin
      ) {
        return false;
      }
    }

    if (commissionMax !== null && !Number.isNaN(commissionMax)) {
      if (item.commission_value !== null && item.commission_value > commissionMax) {
        return false;
      }
    }

    if (salePriceMin !== null && !Number.isNaN(salePriceMin)) {
      if (item.price === null || item.price < salePriceMin) {
        return false;
      }
    }

    if (salePriceMax !== null && !Number.isNaN(salePriceMax)) {
      if (item.price !== null && item.price > salePriceMax) {
        return false;
      }
    }

    return true;
  });
}

export function formatListingPrice(item: CatalogListing) {
  if (item.intent === "buy") {
    if (item.is_free) return "Budget flexible";
    if (item.price === null) return "—";
    return formatSalePrice(item.price);
  }

  return formatCommission(item.commission_type, item.commission_value);
}

export function formatCatalogSalePrice(item: CatalogListing) {
  return formatSalePrice(item.price, item.price_type);
}

export function getCatalogSalePriceLabel(item: CatalogListing) {
  return getSalePriceLabel(item.commission_type, item.price_type);
}

export type PublicListing = CatalogListing & {
  email: string | null;
  user_id: string | null;
  src: ListingSource;
};

export async function fetchPublicListing(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  src: ListingSource,
  id: string,
): Promise<PublicListing | null> {
  if (src === "prod") {
    const primary = await supabase
      .from("products")
      .select(
        "id, listing_type, category, title, description, commission_type, commission_value, price, price_type, address, photos, email, user_id, created_at, status, session_views, favorite_count",
      )
      .eq("id", id)
      .eq("status", "active")
      .maybeSingle();

    const listing =
      primary.data ??
      (primary.error
        ? (
            await supabase
              .from("products")
              .select(
                "id, listing_type, category, title, description, commission_type, commission_value, price, price_type, address, photos, email, user_id, created_at, status",
              )
              .eq("id", id)
              .eq("status", "active")
              .maybeSingle()
          ).data
        : null);

    if (!listing) return null;

    return {
      id: listing.id,
      src,
      intent: sourceToIntent(src),
      listing_type: listing.listing_type,
      category: listing.category,
      title: listing.title,
      description: listing.description,
      commission_type: listing.commission_type,
      commission_value: listing.commission_value,
      price: "price" in listing ? listing.price ?? null : null,
      price_type: "price_type" in listing ? listing.price_type ?? null : null,
      is_free: false,
      address: listing.address,
      photos: listing.photos ?? [],
      email: listing.email,
      user_id: listing.user_id,
      created_at: listing.created_at,
      session_views:
        "session_views" in listing ? Number(listing.session_views ?? 0) || 0 : 0,
      favorite_count:
        "favorite_count" in listing ? Number(listing.favorite_count ?? 0) || 0 : 0,
    };
  }

  const { data } = await supabase
    .from("buy_requests")
    .select(
      "id, listing_type, category, title, description, price, is_free, address, photos, email, user_id, created_at, status, session_views, favorite_count",
    )
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    src,
    intent: sourceToIntent(src),
    listing_type: data.listing_type,
    category: data.category,
    title: data.title,
    description: data.description,
    commission_type: null,
    commission_value: null,
    price: data.price,
    is_free: data.is_free,
    address: data.address,
    photos: data.photos ?? [],
    email: data.email,
    user_id: data.user_id,
    created_at: data.created_at,
    session_views: data.session_views ?? 0,
    favorite_count: data.favorite_count ?? 0,
  };
}
