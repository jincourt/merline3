import { NextResponse } from "next/server";
import { getAppOrigin } from "@/lib/app-origin";
import { createClient } from "@/lib/supabase/server";
import { createListingCheckoutSession } from "@/lib/stripe-checkout";
import { isSubscriptionCurrentlyActive } from "@/lib/subscription";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const listingId = String(body.listingId ?? "").trim();

    if (!listingId) {
      return NextResponse.json({ error: "Annonce manquante." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const { data: listing } = await supabase
      .from("products")
      .select("id, title, status, checkout_plan, checkout_boost, user_id")
      .eq("id", listingId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!listing) {
      return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
    }

    if (listing.status !== "pending_payment") {
      return NextResponse.json(
        { error: "Cette annonce n'est pas en attente de paiement." },
        { status: 400 },
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("merline_pro_active, merline_pro_expires_at")
      .eq("id", user.id)
      .maybeSingle();

    const skipPlanCharge = Boolean(
      profile &&
        isSubscriptionCurrentlyActive(profile) &&
        listing.checkout_plan === "abonnement",
    );

    const origin = getAppOrigin(request);

    const session = await createListingCheckoutSession({
      listing,
      userId: user.id,
      userEmail: user.email,
      skipPlanCharge,
      origin,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Session Stripe invalide." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("stripe/checkout:", error);
    const message =
      error instanceof Error ? error.message : "Paiement indisponible.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
