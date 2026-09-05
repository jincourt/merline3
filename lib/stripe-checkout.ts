import {
  BOOST_PACKS,
  PLANS,
  calculateCheckoutTotal,
  getBoostPriceId,
  getPlanPriceId,
  isBoostPackId,
  isPlanId,
  type BoostPackId,
  type PlanId,
} from "@/lib/plans";
import { syncProfileFromStripeSubscription } from "@/lib/subscription";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

type CheckoutListing = {
  id: string;
  title: string;
  checkout_plan: string | null;
  checkout_boost: string | null;
  user_id: string;
};

function buildLineItem(
  priceId: string | undefined,
  fallback: {
    name: string;
    amount: number;
    mode: "payment" | "subscription";
  },
): Stripe.Checkout.SessionCreateParams.LineItem {
  if (priceId) {
    return { price: priceId, quantity: 1 };
  }

  return {
    quantity: 1,
    price_data: {
      currency: "chf",
      product_data: { name: fallback.name },
      unit_amount: Math.round(fallback.amount * 100),
      ...(fallback.mode === "subscription"
        ? { recurring: { interval: "month" } }
        : {}),
    },
  };
}

export async function createListingCheckoutSession({
  listing,
  userId,
  userEmail,
  skipPlanCharge,
  origin,
}: {
  listing: CheckoutListing;
  userId: string;
  userEmail: string;
  skipPlanCharge: boolean;
  origin: string;
}) {
  if (!listing.checkout_plan || !isPlanId(listing.checkout_plan)) {
    throw new Error("Forfait manquant.");
  }

  const planId = listing.checkout_plan as PlanId;
  const boostId =
    listing.checkout_boost && isBoostPackId(listing.checkout_boost)
      ? (listing.checkout_boost as BoostPackId)
      : null;

  const plan = PLANS[planId];
  const boost = boostId ? BOOST_PACKS[boostId] : null;
  const total = calculateCheckoutTotal(planId, boostId, { skipPlanCharge });

  if (total <= 0) {
    throw new Error("Aucun paiement requis.");
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  if (!skipPlanCharge) {
    lineItems.push(
      buildLineItem(getPlanPriceId(planId), {
        name: `Merline Pro — ${plan.name}`,
        amount: plan.price,
        mode: plan.mode,
      }),
    );
  }

  if (boost) {
    lineItems.push(
      buildLineItem(getBoostPriceId(boost.id), {
        name: `Merline — ${boost.name}`,
        amount: boost.price,
        mode: "payment",
      }),
    );
  }

  const stripe = getStripe();
  const isSubscription = !skipPlanCharge && plan.mode === "subscription";

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    customer_email: userEmail,
    line_items: lineItems,
    success_url: `${origin}/api/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/vendre/paiement?listing=${listing.id}`,
    metadata: {
      listingId: listing.id,
      userId,
      planId,
      boostId: boostId ?? "",
    },
    subscription_data: isSubscription
      ? {
          metadata: {
            listingId: listing.id,
            userId,
            planId,
          },
        }
      : undefined,
  });

  return session;
}

export async function activateListingFromCheckout(metadata: {
  listingId?: string;
  userId?: string;
}) {
  const { listingId, userId } = metadata;
  if (!listingId || !userId) return;

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  await supabase
    .from("products")
    .update({ status: "active" })
    .eq("id", listingId)
    .eq("user_id", userId);
}

export async function activateSubscriptionFromCheckoutSession(
  session: Stripe.Checkout.Session,
) {
  if (
    session.mode !== "subscription" ||
    !session.subscription ||
    !session.metadata?.userId
  ) {
    return;
  }

  const stripe = getStripe();
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncProfileFromStripeSubscription(
    session.metadata.userId,
    subscription,
    customerId ?? null,
  );
}

export async function verifyCheckoutSessionAndActivate(sessionId: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid" && session.status !== "complete") {
    return { ok: false as const, reason: "unpaid" as const };
  }

  await activateListingFromCheckout({
    listingId: session.metadata?.listingId,
    userId: session.metadata?.userId,
  });

  await activateSubscriptionFromCheckoutSession(session);

  return {
    ok: true as const,
    listingId: session.metadata?.listingId ?? null,
    planId: session.metadata?.planId ?? null,
  };
}
