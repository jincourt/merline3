import type Stripe from "stripe";

export type UserSubscription = {
  active: boolean;
  startedAt: string | null;
  expiresAt: string | null;
  autoRenew: boolean;
  stripeSubscriptionId: string | null;
};

type SubscriptionProfileRow = {
  merline_pro_active: boolean | null;
  merline_pro_started_at: string | null;
  merline_pro_expires_at: string | null;
  merline_pro_auto_renew: boolean | null;
  stripe_subscription_id: string | null;
};

const ACTIVE_STRIPE_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
]);

export function formatSubscriptionDate(value: string | null): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function isSubscriptionCurrentlyActive(
  profile: Pick<SubscriptionProfileRow, "merline_pro_active" | "merline_pro_expires_at">,
): boolean {
  if (profile.merline_pro_active !== true) return false;
  if (!profile.merline_pro_expires_at) return true;

  return new Date(profile.merline_pro_expires_at) > new Date();
}

export function mapProfileToUserSubscription(
  profile: SubscriptionProfileRow | null,
): UserSubscription {
  if (!profile) {
    return {
      active: false,
      startedAt: null,
      expiresAt: null,
      autoRenew: true,
      stripeSubscriptionId: null,
    };
  }

  return {
    active: isSubscriptionCurrentlyActive(profile),
    startedAt: profile.merline_pro_started_at,
    expiresAt: profile.merline_pro_expires_at,
    autoRenew: profile.merline_pro_auto_renew !== false,
    stripeSubscriptionId: profile.stripe_subscription_id,
  };
}

export function subscriptionProfileUpdateFromStripe(
  subscription: Stripe.Subscription,
): {
  merline_pro_active: boolean;
  merline_pro_started_at: string;
  merline_pro_expires_at: string;
  merline_pro_auto_renew: boolean;
  stripe_subscription_id: string;
} {
  const active =
    ACTIVE_STRIPE_STATUSES.has(subscription.status) &&
    new Date(subscription.current_period_end * 1000) > new Date();

  return {
    merline_pro_active: active,
    merline_pro_started_at: new Date(
      subscription.current_period_start * 1000,
    ).toISOString(),
    merline_pro_expires_at: new Date(
      subscription.current_period_end * 1000,
    ).toISOString(),
    merline_pro_auto_renew: !subscription.cancel_at_period_end,
    stripe_subscription_id: subscription.id,
  };
}

export async function syncProfileFromStripeSubscription(
  userId: string,
  subscription: Stripe.Subscription,
  customerId?: string | null,
) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const update = subscriptionProfileUpdateFromStripe(subscription);

  await supabase
    .from("profiles")
    .update({
      ...update,
      ...(customerId ? { stripe_customer_id: customerId } : {}),
    })
    .eq("id", userId);
}

export async function getUserSubscription(
  supabase: Awaited<
    ReturnType<typeof import("@/lib/supabase/server").createClient>
  >,
  userId: string,
): Promise<UserSubscription> {
  const { data } = await supabase
    .from("profiles")
    .select(
      "merline_pro_active, merline_pro_started_at, merline_pro_expires_at, merline_pro_auto_renew, stripe_subscription_id",
    )
    .eq("id", userId)
    .maybeSingle();

  return mapProfileToUserSubscription(data);
}

export async function setSubscriptionAutoRenewPreference(
  userId: string,
  autoRenew: boolean,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_subscription_id, merline_pro_active, merline_pro_expires_at")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || !isSubscriptionCurrentlyActive(profile)) {
    return { ok: false, message: "Aucun abonnement actif." };
  }

  if (profile.stripe_subscription_id) {
    try {
      const { getStripe } = await import("@/lib/stripe");
      const stripe = getStripe();
      const subscription = await stripe.subscriptions.update(
        profile.stripe_subscription_id,
        { cancel_at_period_end: !autoRenew },
      );
      await syncProfileFromStripeSubscription(userId, subscription);
    } catch (error) {
      console.error("setSubscriptionAutoRenewPreference:", error);
      return {
        ok: false,
        message: "Impossible de mettre à jour le renouvellement.",
      };
    }
  } else {
    const { error } = await supabase
      .from("profiles")
      .update({ merline_pro_auto_renew: autoRenew })
      .eq("id", userId);

    if (error) {
      console.error("setSubscriptionAutoRenewPreference:", error.message);
      return {
        ok: false,
        message: "Impossible de mettre à jour le renouvellement.",
      };
    }
  }

  return { ok: true };
}
