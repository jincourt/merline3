import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { DashboardFavoritesPanel } from "@/components/listings/DashboardFavoritesPanel";
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
    <div className="dashboard-listings-page dashboard-favorites-page mx-auto w-full max-w-[56rem] px-4 pb-16 pt-24 sm:px-6 md:pb-20 md:pt-32">
      <PageMotion>
        <header className="dashboard-listings-head">
          <div className="dashboard-listings-head-main">
            <h1 className="public-profile-name">Mes favoris</h1>
            <p className="public-profile-meta">{formatFavoritesMeta(listings.length)}</p>
          </div>

          <div className="dashboard-listings-head-actions">
            <Link
              href="/#catalogue"
              className="dashboard-listings-head-btn dashboard-listings-head-btn-dark"
            >
              Parcourir le catalogue
            </Link>
          </div>
        </header>
      </PageMotion>

      <DashboardFavoritesPanel listings={listings} />
    </div>
  );
}
