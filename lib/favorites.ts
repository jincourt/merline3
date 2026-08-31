import { getProfileReviewSummariesForProfiles } from "@/lib/profile-reviews";
import type { BuyRequest, CatalogListing, ListingSource, Product } from "@/lib/types";
import { sourceToIntent } from "@/lib/types";

type FavoriteRow = {
  listing_id: string;
  src: ListingSource;
  created_at: string;
};

type ListingOwnerRef = {
  listing: CatalogListing;
  ownerId?: string;
};

function enrichListingsWithOwners(
  listings: ListingOwnerRef[],
  profiles: { id: string; name: string | null; username: string | null; avatar_url: string | null }[],
  reviewSummaries: Map<string, { averageRating: number | null; count: number }>,
): CatalogListing[] {
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));

  return listings.map(({ listing, ownerId }) => {
    if (!ownerId) return listing;

    const profile = profileById.get(ownerId);
    const reviews = reviewSummaries.get(ownerId);

    return {
      ...listing,
      ownerName: profile?.name?.trim() ?? "",
      ownerUsername: profile?.username?.trim() ?? "",
      ownerAvatarUrl: profile?.avatar_url?.trim() ?? "",
      ownerAverageRating: reviews?.averageRating ?? null,
      ownerReviewCount: reviews?.count ?? 0,
    };
  });
}

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
            "id, user_id, listing_type, category, title, description, commission_type, commission_value, price, address, photos, created_at, status, session_views, favorite_count",
          )
          .in("id", prodIds)
          .eq("status", "active")
      : Promise.resolve({ data: [] as Product[] }),
    buyIds.length
      ? supabase
          .from("buy_requests")
          .select(
            "id, user_id, listing_type, category, title, description, price, is_free, address, photos, created_at, status, session_views, favorite_count",
          )
          .in("id", buyIds)
          .eq("status", "active")
      : Promise.resolve({ data: [] as BuyRequest[] }),
  ]);

  const productsById = new Map(
    (productsResult.data ?? []).map((item) => [item.id, item]),
  );
  const buyRequestsById = new Map(
    (buyRequestsResult.data ?? []).map((item) => [item.id, item]),
  );

  const listingRefs = rows.flatMap((row): ListingOwnerRef[] => {
    if (row.src === "prod") {
      const product = productsById.get(row.listing_id);
      if (!product) return [];

      return [
        {
          ownerId: product.user_id ?? undefined,
          listing: {
            id: product.id,
            intent: sourceToIntent("prod"),
            listing_type: product.listing_type,
            category: product.category,
            title: product.title,
            description: product.description,
            commission_type: product.commission_type,
            commission_value: product.commission_value,
            price: product.price ?? null,
            is_free: false,
            address: product.address,
            photos: product.photos ?? [],
            created_at: product.created_at,
            session_views: product.session_views ?? 0,
            favorite_count: product.favorite_count ?? 0,
          },
        },
      ];
    }

    const buyRequest = buyRequestsById.get(row.listing_id);
    if (!buyRequest) return [];

    return [
      {
        ownerId: buyRequest.user_id ?? undefined,
        listing: {
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
          session_views: buyRequest.session_views ?? 0,
          favorite_count: buyRequest.favorite_count ?? 0,
        },
      },
    ];
  });

  const ownerIds = [
    ...new Set(
      listingRefs
        .map((entry) => entry.ownerId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (!ownerIds.length) {
    return listingRefs.map((entry) => entry.listing);
  }

  const [{ data: profiles }, reviewSummaries] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, name, username, avatar_url")
      .in("id", ownerIds),
    getProfileReviewSummariesForProfiles(supabase, ownerIds),
  ]);

  return enrichListingsWithOwners(listingRefs, profiles ?? [], reviewSummaries);
}
