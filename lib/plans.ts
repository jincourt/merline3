export type PlanId = "mensuel" | "annuel" | "ponctuel";

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  period: string;
  description: string;
  mode: "subscription" | "payment";
  priceEnvKey: string;
};

export const PLANS: Record<PlanId, Plan> = {
  mensuel: {
    id: "mensuel",
    name: "Mensuel",
    price: 149,
    period: "/ mois",
    description: "Annonces illimitées, diffusion multi-plateformes.",
    mode: "subscription",
    priceEnvKey: "STRIPE_PRICE_MENSUEL",
  },
  annuel: {
    id: "annuel",
    name: "Annuel",
    price: 1199,
    period: "/ an",
    description: "Le meilleur rapport qualité-prix.",
    mode: "subscription",
    priceEnvKey: "STRIPE_PRICE_ANNUEL",
  },
  ponctuel: {
    id: "ponctuel",
    name: "Ponctuel",
    price: 59,
    period: " une fois",
    description: "Une annonce, sans engagement.",
    mode: "payment",
    priceEnvKey: "STRIPE_PRICE_PONCTUEL",
  },
};

export function getPlanPriceId(planId: PlanId): string | undefined {
  const plan = PLANS[planId];
  return process.env[plan.priceEnvKey];
}

export function isPlanId(value: string): value is PlanId {
  return value in PLANS;
}
