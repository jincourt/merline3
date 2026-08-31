import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { CatalogCard } from "@/components/catalog/CatalogCard";
import { PageMotion } from "@/components/layout/PageMotion";
import { fetchFavoriteListings } from "@/lib/favorites";

function formatFavoritesMeta(count: number) {
  if (count === 0) {
    return "Retrouvez les annonces que vous avez enregistrées.";
  }

  return `${count} annonce${count > 1 ? "s" : ""} enregistrée${count > 1 ? "s" : ""}`;
}

export default async function FavorisPage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const listings = await fetchFavoriteListings(supabase, user.id);

  return (
    <div className="favorites-page mx-auto w-full max-w-[1200px] px-6 pb-16 pt-24 md:pb-20 md:pt-32">
      <PageMotion>
        <header className="favorites-page-head">
          <div className="favorites-page-head-main">
            <h1 className="public-profile-name">Mes favoris</h1>
            <p className="public-profile-meta">{formatFavoritesMeta(listings.length)}</p>
          </div>

          <div className="favorites-page-head-actions">
            <Link
              href="/#catalogue"
              className="dashboard-listings-head-btn dashboard-listings-head-btn-dark"
            >
              Parcourir
            </Link>
          </div>
        </header>
      </PageMotion>

      {listings.length === 0 ? (
        <PageMotion delay={0.06}>
          <div className="messages-empty favorites-empty">
            <p className="messages-empty-title">Aucun favori</p>
            <p className="messages-empty-desc">
              Enregistrez des annonces depuis le catalogue pour les retrouver ici.
            </p>
            <Link
              href="/#catalogue"
              className="dashboard-listings-head-btn dashboard-listings-head-btn-primary favorites-empty-cta"
            >
              Voir le catalogue
            </Link>
          </div>
        </PageMotion>
      ) : (
        <PageMotion delay={0.06}>
          <div className="catalog-grid favorites-grid">
            {listings.map((listing, index) => (
              <CatalogCard
                key={`${listing.intent}-${listing.id}`}
                listing={listing}
                delay={index * 0.04}
                variant="grid"
              />
            ))}
          </div>
        </PageMotion>
      )}
    </div>
  );
}
