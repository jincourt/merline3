import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { DashboardListingsPanel } from "@/components/listings/DashboardListingsPanel";
import { CheckoutFeedbackBanner } from "@/components/listings/CheckoutFeedbackBanner";
import type { DashboardListing } from "@/components/listings/ListingRow";
import { PageMotion } from "@/components/layout/PageMotion";
import { Suspense } from "react";

export default async function AnnoncesPage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, title, category, status, commission_type, commission_value, photos, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const listings: DashboardListing[] = (products ?? []).map((item) => ({
    ...item,
    intent: "sell" as const,
  }));

  return (
    <PageMotion className="dashboard-page">
      <h1 className="dashboard-page-title">Mes annonces</h1>
      <Suspense fallback={null}>
        <CheckoutFeedbackBanner />
      </Suspense>
      <DashboardListingsPanel listings={listings} />
    </PageMotion>
  );
}
