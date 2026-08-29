import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getUser } from "@/lib/auth";
import { ListingForm } from "@/components/listings/ListingForm";
import { PageMotion } from "@/components/layout/PageMotion";
import type { EditListingData, Product } from "@/lib/types";

function isIntent(value: string): value is "sell" | "buy" {
  return value === "sell" || value === "buy";
}

export default async function ModifierAnnoncePage({
  params,
}: {
  params: Promise<{ intent: string; id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login?next=/dashboard/annonces");

  const { intent, id } = await params;
  if (!isIntent(intent) || intent !== "sell") notFound();

  const supabase = await createClient();
  const table = "products";

  const { data } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) notFound();

  const listing = data as Product;
  const profile = await getProfile();

  const editListing: EditListingData = {
    id: listing.id,
    listing_type: listing.listing_type,
    category: listing.category,
    title: listing.title,
    description: listing.description,
    commission_type: listing.commission_type,
    commission_value: listing.commission_value,
    price: listing.price ?? null,
    address: listing.address,
    email: listing.email,
    photos: listing.photos ?? [],
  };

  return (
    <PageMotion className="dashboard-page">
      <Link
        href="/dashboard/annonces"
        className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        ← Retour à vos annonces
      </Link>

      <div className="mt-4 border-b border-[var(--border)] pb-5">
        <h1 className="dashboard-page-title">Modifier l&apos;annonce</h1>
        <p className="dashboard-page-desc">
          Annonce de vente · {listing.title}
        </p>
      </div>

      <div className="mt-6">
        <ListingForm
          mode="sell"
          isAuthenticated
          editListing={editListing}
          profile={
            profile
              ? {
                  email: profile.email,
                }
              : null
          }
        />
      </div>
    </PageMotion>
  );
}
