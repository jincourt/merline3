import type { BuyRequest, CatalogListing, ListingSource, Product } from "@/lib/types";
import {
  formatCommission,
  formatSalePrice,
  getSalePriceLabel,
  sourceToIntent,
} from "@/lib/types";

export type CatalogFilters = {
  q: string;
  listingType: "objet" | "service" | null;
  category: string;
  priceMin: string;
  priceMax: string;
};

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  q: "",
  listingType: null,
  category: "",
  priceMin: "",
  priceMax: "",
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

export function filterCatalogListings(
  listings: CatalogListing[],
  filters: CatalogFilters,
): CatalogListing[] {
  const query = filters.q.trim().toLowerCase();
  const min = filters.priceMin ? Number(filters.priceMin) : null;
  const max = filters.priceMax ? Number(filters.priceMax) : null;

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

    if (min !== null && !Number.isNaN(min)) {
      if (item.commission_value === null || item.commission_value < min) {
        return false;
      }
    }

    if (max !== null && !Number.isNaN(max)) {
      if (item.commission_value !== null && item.commission_value > max) {
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
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency: "CHF",
      maximumFractionDigits: 0,
    }).format(item.price);
  }

  return formatCommission(item.commission_type, item.commission_value);
}

export function formatCatalogSalePrice(item: CatalogListing) {
  return formatSalePrice(item.price);
}

export function getCatalogSalePriceLabel(item: CatalogListing) {
  return getSalePriceLabel(item.commission_type);
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
        "id, listing_type, category, title, description, commission_type, commission_value, price, address, photos, email, user_id, created_at, status, session_views, favorite_count",
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
                "id, listing_type, category, title, description, commission_type, commission_value, price, address, photos, email, user_id, created_at, status",
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
