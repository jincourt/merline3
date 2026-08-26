import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { ListingRow, type DashboardListing } from "@/components/listings/ListingRow";
import { PageMotion } from "@/components/layout/PageMotion";

export default async function AnnoncesPage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, title, category, status, commission_type, commission_value, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const listings: DashboardListing[] = (products ?? []).map((item) => ({
    ...item,
    intent: "sell" as const,
  }));

  return (
    <PageMotion className="dashboard-page">
      <h1 className="dashboard-page-title">Vos annonces</h1>
      <p className="dashboard-page-desc">Gérez vos annonces de vente.</p>

      {listings.length === 0 ? (
        <div className="dashboard-empty">
          <p className="text-sm text-[var(--muted)]">
            Vous n&apos;avez pas encore d&apos;annonce.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/vendre" className="btn-primary">
              Publier une annonce
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-2.5">
          {listings.map((listing) => (
            <ListingRow key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </PageMotion>
  );
}
