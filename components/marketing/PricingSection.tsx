import { CheckoutButton } from "./CheckoutButton";
import { AnimatedPlanCard } from "./AnimatedPlanCard";
import { MotionDiv } from "@/components/ui/motion";
import { SectionShell } from "@/components/layout/SectionShell";
import type { PlanId } from "@/lib/plans";

const plans = [
  {
    id: "mensuel" as PlanId,
    name: "Mensuel",
    price: "149",
    period: "/ mois",
    description: "Pour vendre régulièrement.",
    features: [
      "Annonces illimitées",
      "Diffusion multi-plateformes",
      "50 CHF.- de publicité inclus",
    ],
    cta: "Choisir mensuel",
    highlighted: false,
  },
  {
    id: "annuel" as PlanId,
    name: "Annuel",
    price: "1199",
    period: "/ an",
    description: "Le meilleur rapport qualité-prix.",
    badge: "Populaire",
    features: [
      "Tout le forfait mensuel",
      "Priorité de publication",
      "400 CHF.- de publicité inclus",
    ],
    cta: "Choisir annuel",
    highlighted: true,
  },
  {
    id: "ponctuel" as PlanId,
    name: "Ponctuel",
    price: "59",
    period: " une fois",
    description: "Une annonce, sans engagement.",
    features: [
      "1 annonce publiée",
      "Diffusion complète",
      "Sans abonnement",
    ],
    cta: "Publier une annonce",
    highlighted: false,
  },
] as const;

export function PricingSection() {
  return (
    <SectionShell id="forfait" variant="dark" geo className="border-b-0">
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
        <MotionDiv>
          <p className="section-eyebrow">Forfait</p>
          <h2 className="section-title mt-4 max-w-2xl">
            Un tarif simple, adapté à votre usage.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)] md:text-base">
            Mensuel, annuel ou achat unique — choisissez la formule qui vous
            convient. Sans frais cachés.
          </p>
        </MotionDiv>

        <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          {plans.map((plan, index) => (
            <AnimatedPlanCard
              key={plan.name}
              delay={index * 0.1}
              className={`pricing-card ${plan.highlighted ? "pricing-card-highlighted" : ""}`}
            >
              {"badge" in plan && plan.badge ? (
                <span className="pricing-badge">{plan.badge}</span>
              ) : null}

              <p className="text-sm font-medium text-[var(--foreground)]">
                {plan.name}
              </p>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-medium tracking-tight text-[var(--foreground)]">
                  CHF {plan.price}
                </span>
                <span className="text-xs text-[var(--muted)]">{plan.period}</span>
              </div>

              <p className="mt-3 text-sm text-[var(--muted)]">{plan.description}</p>

              <ul className="mt-5 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-xs text-[var(--muted)]"
                  >
                    <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--indigo)]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <CheckoutButton
                planId={plan.id}
                label={plan.cta}
                className={`mt-6 w-full ${plan.highlighted ? "btn-primary" : "btn-ghost"}`}
              />
            </AnimatedPlanCard>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
