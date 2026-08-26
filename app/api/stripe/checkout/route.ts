import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getPlanPriceId, isPlanId, PLANS } from "@/lib/plans";

export async function POST(request: Request) {
  try {
    const { planId } = await request.json();

    if (!planId || !isPlanId(planId)) {
      return NextResponse.json({ error: "Forfait invalide." }, { status: 400 });
    }

    const priceId = getPlanPriceId(planId);
    if (!priceId) {
      return NextResponse.json(
        { error: "Prix Stripe non configuré pour ce forfait." },
        { status: 500 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json(
        { error: "Connectez-vous pour payer." },
        { status: 401 },
      );
    }

    const plan = PLANS[planId];
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: plan.mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/paiement/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/paiement?plan=${planId}`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
      ...(plan.mode === "subscription"
        ? {
            subscription_data: {
              metadata: { user_id: user.id, plan_id: planId },
            },
          }
        : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("stripe checkout:", error);
    return NextResponse.json(
      { error: "Impossible de créer la session de paiement." },
      { status: 500 },
    );
  }
}
