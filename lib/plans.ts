export type PlanId = "publication" | "abonnement";

export type BoostPackId = "boost_7" | "boost_14" | "boost_30";

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  description: string;
  mode: "subscription" | "payment";
  priceEnvKey: string;
  features: readonly string[];
};

export type BoostPack = {
  id: BoostPackId;
  name: string;
  price: number;
  originalPrice?: number;
  duration: string;
  description: string;
  priceEnvKey: string;
  features: readonly string[];
  highlighted?: boolean;
  badge?: string;
};

export const PLANS: Record<PlanId, Plan> = {
  publication: {
    id: "publication",
    name: "Publication",
    price: 19,
    originalPrice: 29,
    period: " une fois",
    description: "Publiez une annonce sans abonnement.",
    mode: "payment",
    priceEnvKey: "STRIPE_PRICE_PUBLICATION",
    features: [
      "1 annonce publiée",
      "Diffusion auprès des agents",
      "Sans engagement",
    ],
  },
  abonnement: {
    id: "abonnement",
    name: "Abonnement",
    price: 69,
    originalPrice: 119,
    period: "/ mois",
    description: "Annonces illimitées et mise en avant.",
    mode: "subscription",
    priceEnvKey: "STRIPE_PRICE_ABONNEMENT",
    features: [
      "Annonces gratuites et illimitées",
      "Mise en avant dans le catalogue",
      "Priorité auprès des agents",
    ],
  },
};

export const BOOST_PACKS: Record<BoostPackId, BoostPack> = {
  boost_7: {
    id: "boost_7",
    name: "Boost 7 jours",
    price: 49,
    originalPrice: 89,
    duration: "7 jours",
    description: "Visibilité x100 pendant une semaine.",
    priceEnvKey: "STRIPE_PRICE_BOOST_7",
    features: [
      "Boost x100 sur l'application",
      "Placement en tête du catalogue",
      "Idéal pour une vente rapide",
    ],
  },
  boost_14: {
    id: "boost_14",
    name: "Boost 14 jours",
    price: 89,
    originalPrice: 149,
    duration: "14 jours",
    description: "Deux semaines de promotion intensive.",
    badge: "Populaire",
    highlighted: true,
    priceEnvKey: "STRIPE_PRICE_BOOST_14",
    features: [
      "Boost x100 sur l'application",
      "Placement en tête du catalogue",
      "Meilleur rapport durée/prix",
    ],
  },
  boost_30: {
    id: "boost_30",
    name: "Boost 30 jours",
    price: 149,
    originalPrice: 249,
    duration: "30 jours",
    description: "Un mois complet de visibilité maximale.",
    priceEnvKey: "STRIPE_PRICE_BOOST_30",
    features: [
      "Boost x100 sur l'application",
      "Placement en tête du catalogue",
      "Pour les annonces à fort potentiel",
    ],
  },
};

export function getPlanPriceId(planId: PlanId): string | undefined {
  const plan = PLANS[planId];
  return readEnvValue(plan.priceEnvKey);
}

export function getBoostPriceId(boostId: BoostPackId): string | undefined {
  const pack = BOOST_PACKS[boostId];
  return readEnvValue(pack.priceEnvKey);
}

function readEnvValue(key: string): string | undefined {
  const raw = process.env[key]?.trim();
  if (!raw) return undefined;
  // Ignore inline comments in .env (e.g. price_xxx # 19 CHF)
  const value = raw.split("#")[0]?.trim();
  return value || undefined;
}

export function isPlanId(value: string): value is PlanId {
  return value in PLANS;
}

export function isBoostPackId(value: string): value is BoostPackId {
  return value in BOOST_PACKS;
}

export function calculateCheckoutTotal(
  planId: PlanId,
  boostId: BoostPackId | null,
  options?: { skipPlanCharge?: boolean },
): number {
  let total = options?.skipPlanCharge ? 0 : PLANS[planId].price;
  if (boostId) {
    total += BOOST_PACKS[boostId].price;
  }
  return total;
}

export function formatChf(amount: number): string {
  return `CHF ${amount}.-`;
}

export function hasPricingDiscount(
  price: number,
  originalPrice?: number,
): originalPrice is number {
  return originalPrice != null && originalPrice > price;
}
