import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ListingCheckoutPayment,
  ListingCheckoutSummary,
} from "@/components/listings/ListingCheckout";
import { getUser } from "@/lib/auth";
import {
  calculateCheckoutTotal,
  isBoostPackId,
  isPlanId,
  type BoostPackId,
  type PlanId,
} from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { isSubscriptionCurrentlyActive } from "@/lib/subscription";

export const metadata: Metadata = {
  title: "Paiement — Merline",
  robots: { index: false, follow: false },
};

export default async function VendrePaiementPage({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string }>;
}) {
  const { listing: listingId } = await searchParams;
  const user = await getUser();

  if (!user) {
    redirect(
      `/login?next=/vendre/paiement${listingId ? `?listing=${listingId}` : ""}`,
    );
  }

  if (!listingId) {
    redirect("/vendre");
  }

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("products")
    .select("id, title, photos, status, checkout_plan, checkout_boost, user_id")
    .eq("id", listingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!listing) {
    redirect("/vendre");
  }

  if (listing.status === "active") {
    redirect("/dashboard/annonces");
  }

  if (listing.status === "draft") {
    redirect(`/vendre/plan?listing=${listingId}`);
  }

  if (!listing.checkout_plan || !isPlanId(listing.checkout_plan)) {
    redirect(`/vendre/plan?listing=${listingId}`);
  }

  const planId = listing.checkout_plan as PlanId;
  const boostId =
    listing.checkout_boost && isBoostPackId(listing.checkout_boost)
      ? (listing.checkout_boost as BoostPackId)
      : null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("merline_pro_active, merline_pro_expires_at")
    .eq("id", user.id)
    .maybeSingle();

  const skipPlanCharge = Boolean(
    profile && isSubscriptionCurrentlyActive(profile) && planId === "abonnement",
  );
  const total = calculateCheckoutTotal(planId, boostId, { skipPlanCharge });
  const listingPhoto =
    (listing.photos as string[] | null)?.find((photo) => photo?.startsWith("http")) ??
    null;

  if (total <= 0) {
    await supabase
      .from("products")
      .update({ status: "active" })
      .eq("id", listingId)
      .eq("user_id", user.id);
    redirect("/dashboard/annonces");
  }

  return (
    <div className="pro-checkout min-h-screen">
      <ListingCheckoutSummary
        listingTitle={listing.title}
        listingPhoto={listingPhoto}
        planId={planId}
        boostId={boostId}
        skipPlanCharge={skipPlanCharge}
      />
      <ListingCheckoutPayment listingId={listingId} total={total} />
    </div>
  );
}
