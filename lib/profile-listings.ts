import type { CatalogListing, BuyRequest, Product } from "@/lib/types";
import { buyRequestToCatalogListing, mergeCatalogListings } from "@/lib/catalog";

export async function getProfileListings(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
): Promise<CatalogListing[]> {
  const [{ data: products }, { data: buyRequests }] = await Promise.all([
    supabase
      .from("products")
      .select(
            "id, listing_type, category, title, description, commission_type, commission_value, price, price_type, address, photos, created_at, status, session_views, favorite_count",
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("buy_requests")
      .select(
            "id, listing_type, category, title, description, price, is_free, address, photos, created_at, status, session_views, favorite_count",
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
  ]);

  const sellListings = mergeCatalogListings((products ?? []) as Product[]);
  const buyListings = (buyRequests ?? []).map((item) =>
    buyRequestToCatalogListing(item as BuyRequest),
  );

  return [...sellListings, ...buyListings].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}
