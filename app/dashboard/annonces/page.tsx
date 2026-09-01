import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { getAgentDisplayName } from "@/lib/agent-profiles";
import { getProfileHref } from "@/lib/profile-reviews";
import { getUserProfile } from "@/lib/profile";
import { DashboardListingsPanel } from "@/components/listings/DashboardListingsPanel";
import type { DashboardListing } from "@/components/listings/DashboardListingCard";
import { CheckoutFeedbackBanner } from "@/components/listings/CheckoutFeedbackBanner";
import { PageMotion } from "@/components/layout/PageMotion";

function countActiveListings(listings: DashboardListing[]) {
  return listings.filter((listing) => listing.status === "active").length;
}

export default async function AnnoncesPage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();

  const [{ data: products }, profile] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, title, category, status, commission_type, commission_value, price, address, photos, created_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    getUserProfile(supabase, user.id),
  ]);

  const listings: DashboardListing[] = (products ?? []).map((item) => ({
    ...item,
    intent: "sell" as const,
  }));

  const activeCount = countActiveListings(listings);
  const displayName = profile ? getAgentDisplayName(profile) : "Mon compte";
  const profileHref = profile?.username ? getProfileHref(profile.username) : null;

  return (
    <div className="dashboard-listings-page mx-auto w-full max-w-[56rem] px-4 pb-16 pt-24 sm:px-6 md:pb-20 md:pt-32">
      <PageMotion>
        <header className="dashboard-listings-head">
          <div className="dashboard-listings-head-main">
            <h1 className="public-profile-name">Mes annonces</h1>
            <p className="public-profile-meta">
              {listings.length > 0
                ? `${activeCount} active${activeCount > 1 ? "s" : ""} sur ${listings.length}`
                : `${displayName} · Publiez votre première annonce`}
            </p>
          </div>

          <div className="dashboard-listings-head-actions">
            {profileHref ? (
              <Link
                href={profileHref}
                className="dashboard-listings-head-btn dashboard-listings-head-btn-dark"
              >
                Voir profil
              </Link>
            ) : null}
            <Link
              href="/vendre"
              className="dashboard-listings-head-btn dashboard-listings-head-btn-primary"
            >
              Publier une annonce
            </Link>
          </div>
        </header>
      </PageMotion>

      <PageMotion delay={0.04}>
        <Suspense fallback={null}>
          <CheckoutFeedbackBanner />
        </Suspense>
      </PageMotion>

      <DashboardListingsPanel listings={listings} />
    </div>
  );
}
