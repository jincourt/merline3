import type { CatalogListing, ListingSource } from "@/lib/types";
import { sourceToIntent } from "@/lib/types";

type FavoriteRow = {
  listing_id: string;
  src: ListingSource;
  created_at: string;
};

export async function isListingFavorited(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
  listingId: string,
  src: ListingSource,
): Promise<boolean> {
  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .eq("src", src)
    .maybeSingle();

  return Boolean(data);
}

export async function fetchFavoriteListings(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
): Promise<CatalogListing[]> {
  const { data: favorites } = await supabase
    .from("favorites")
    .select("listing_id, src, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!favorites?.length) {
    return [];
  }

  const rows = favorites as FavoriteRow[];
  const prodIds = rows.filter((row) => row.src === "prod").map((row) => row.listing_id);
  const buyIds = rows.filter((row) => row.src === "buy").map((row) => row.listing_id);

  const [productsResult, buyRequestsResult] = await Promise.all([
    prodIds.length
      ? supabase
          .from("products")
          .select(
            "id, listing_type, category, title, description, commission_type, commission_value, address, photos, created_at, status",
          )
          .in("id", prodIds)
          .eq("status", "active")
      : Promise.resolve({ data: [] }),
    buyIds.length
      ? supabase
          .from("buy_requests")
          .select(
            "id, listing_type, category, title, description, price, is_free, address, photos, created_at, status",
          )
          .in("id", buyIds)
          .eq("status", "active")
      : Promise.resolve({ data: [] }),
  ]);

  const productsById = new Map(
    (productsResult.data ?? []).map((item) => [item.id, item]),
  );
  const buyRequestsById = new Map(
    (buyRequestsResult.data ?? []).map((item) => [item.id, item]),
  );

  return rows.flatMap((row) => {
    if (row.src === "prod") {
      const product = productsById.get(row.listing_id);
      if (!product) return [];

      return [
        {
          id: product.id,
          intent: sourceToIntent("prod"),
          listing_type: product.listing_type,
          category: product.category,
          title: product.title,
          description: product.description,
          commission_type: product.commission_type,
          commission_value: product.commission_value,
          price: null,
          is_free: false,
          address: product.address,
          photos: product.photos ?? [],
          created_at: product.created_at,
        } satisfies CatalogListing,
      ];
    }

    const buyRequest = buyRequestsById.get(row.listing_id);
    if (!buyRequest) return [];

    return [
      {
        id: buyRequest.id,
        intent: sourceToIntent("buy"),
        listing_type: buyRequest.listing_type,
        category: buyRequest.category,
        title: buyRequest.title,
        description: buyRequest.description,
        commission_type: null,
        commission_value: null,
        price: buyRequest.price,
        is_free: buyRequest.is_free,
        address: buyRequest.address,
        photos: buyRequest.photos ?? [],
        created_at: buyRequest.created_at,
      } satisfies CatalogListing,
    ];
  });
}
