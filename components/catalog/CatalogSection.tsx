import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Product } from "@/lib/types";
import { mergeCatalogListings } from "@/lib/catalog";
import { getProfileReviewSummariesForProfiles } from "@/lib/profile-reviews";
import { CatalogBrowser } from "./CatalogBrowser";

async function fetchListings() {
  if (!isSupabaseConfigured()) {
    console.error(
      "Catalog unavailable: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
    return [];
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Catalog fetch failed:", error.message);
      return [];
    }

    const products = (data ?? []) as Product[];
    const listings = mergeCatalogListings(products);
    const ownerIds = [
      ...new Set(
        products
          .map((product) => product.user_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    if (ownerIds.length === 0) return listings;

    const [{ data: profiles, error: profilesError }, reviewSummaries] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, name, username, avatar_url")
          .in("id", ownerIds),
        getProfileReviewSummariesForProfiles(supabase, ownerIds),
      ]);

    if (profilesError) {
      console.error("Catalog owner fetch failed:", profilesError.message);
      return listings;
    }

    const profileById = new Map(
      (profiles ?? []).map((profile) => [profile.id, profile]),
    );
    const ownerByListingId = new Map(
      products
        .filter((product) => product.user_id)
        .map((product) => [product.id, product.user_id!]),
    );

    return listings.map((listing) => {
      const ownerId = ownerByListingId.get(listing.id);
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
  } catch (error) {
    console.error("Catalog fetch failed:", error);
    return [];
  }
}

type CatalogSectionProps = {
  pageSize?: number;
  showSearch?: boolean;
  layout?: "list" | "grid";
};

export async function CatalogSection({
  pageSize,
  showSearch = false,
  layout = "list",
}: CatalogSectionProps) {
  const listings = await fetchListings();

  return (
    <CatalogBrowser
      listings={listings}
      pageSize={pageSize}
      showSearch={showSearch}
      layout={layout}
    />
  );
}
