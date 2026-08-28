import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { CatalogCard } from "@/components/catalog/CatalogCard";
import { PageMotion } from "@/components/layout/PageMotion";
import { fetchFavoriteListings } from "@/lib/favorites";

export default async function FavorisPage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const listings = await fetchFavoriteListings(supabase, user.id);

  return (
    <PageMotion className="dashboard-page">
      <h1 className="dashboard-page-title">Mes favoris</h1>
      <p className="dashboard-page-desc">
        Retrouvez les annonces que vous avez enregistrées.
      </p>

      {listings.length === 0 ? (
        <div className="dashboard-empty">
          <p className="text-sm text-[var(--muted)]">
            Vous n&apos;avez pas encore d&apos;annonce en favori.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {listings.map((listing, index) => (
            <CatalogCard
              key={`${listing.intent}-${listing.id}`}
              listing={listing}
              delay={index * 0.05}
              variant="grid"
            />
          ))}
        </div>
      )}
    </PageMotion>
  );
}
