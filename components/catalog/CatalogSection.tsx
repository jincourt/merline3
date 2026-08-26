import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Product } from "@/lib/types";
import { mergeCatalogListings } from "@/lib/catalog";
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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Catalog fetch failed:", error.message);
      return [];
    }

    const products = (data ?? []) as Product[];

    return mergeCatalogListings(products);
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
