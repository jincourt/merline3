import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  activateListingFromCheckout,
  activateSubscriptionFromCheckoutSession,
} from "@/lib/stripe-checkout";
import { syncProfileFromStripeSubscription } from "@/lib/subscription";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("stripe/webhook signature:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await activateListingFromCheckout({
          listingId: session.metadata?.listingId,
          userId: session.metadata?.userId,
        });
        await activateSubscriptionFromCheckoutSession(session);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (userId) {
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id;
          await syncProfileFromStripeSubscription(
            userId,
            subscription,
            customerId ?? null,
          );
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (userId) {
          const { createAdminClient } = await import("@/lib/supabase/admin");
          const supabase = createAdminClient();
          await supabase
            .from("profiles")
            .update({
              merline_pro_active: false,
              merline_pro_auto_renew: false,
              stripe_subscription_id: null,
            })
            .eq("id", userId);
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("stripe/webhook handler:", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
