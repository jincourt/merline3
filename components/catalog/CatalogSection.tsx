import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { mergeCatalogListings } from "@/lib/catalog";
import { CatalogBrowser } from "./CatalogBrowser";

async function fetchListings() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const products = (data ?? []) as Product[];

  return mergeCatalogListings(products);
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
