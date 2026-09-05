import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getUser } from "@/lib/auth";
import { ListingForm } from "@/components/listings/ListingForm";
import { ListingDeleteButton } from "@/components/listings/ListingDeleteButton";
import { MotionDiv } from "@/components/ui/motion";
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
    price_type: listing.price_type ?? null,
    address: listing.address,
    email: listing.email,
    photos: listing.photos ?? [],
  };

  return (
    <div className="listing-edit-page mx-auto w-full max-w-[1200px] px-6 pb-16 pt-24 md:pb-20 md:pt-32">
      <div className="vendre-page-grid">
        <MotionDiv className="vendre-page-intro">
          <Link href="/dashboard/annonces" className="listing-edit-back">
            ← Retour à vos annonces
          </Link>
          <h1 className="marketing-section-title">Modifier l&apos;annonce</h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
            Mettez à jour les informations de votre annonce. Les changements
            seront visibles dès l&apos;enregistrement.
          </p>
          {listing.title ? (
            <p className="listing-edit-listing-title">{listing.title}</p>
          ) : null}
        </MotionDiv>

        <MotionDiv delay={0.05} className="vendre-page-form">
          <ListingForm
            mode="sell"
            flat
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

          <div className="listing-edit-danger">
            <ListingDeleteButton
              listingId={listing.id}
              intent="sell"
              title={listing.title}
            />
          </div>
        </MotionDiv>
      </div>
    </div>
  );
}
