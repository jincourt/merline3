import { CheckoutButton } from "./CheckoutButton";
import { AnimatedPlanCard } from "./AnimatedPlanCard";
import { MotionDiv } from "@/components/ui/motion";
import { PricingAmount } from "@/components/marketing/PricingAmount";
import { SectionShell } from "@/components/layout/SectionShell";
import { PLANS, type PlanId } from "@/lib/plans";

const plans = (Object.keys(PLANS) as PlanId[]).map((id) => ({
  ...PLANS[id],
  cta: id === "publication" ? "Publier une annonce" : "S'abonner",
  highlighted: id === "abonnement",
  badge: id === "abonnement" ? "Populaire" : undefined,
}));

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
            Publication à l&apos;unité ou abonnement mensuel — choisissez la formule
            qui vous convient.
          </p>
        </MotionDiv>

        <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-5">
          {plans.map((plan, index) => (
            <AnimatedPlanCard
              key={plan.name}
              delay={index * 0.1}
              className={`pricing-card ${plan.highlighted ? "pricing-card-highlighted" : ""}`}
            >
              {plan.badge ? <span className="pricing-badge">{plan.badge}</span> : null}

              <p className="text-sm font-medium text-[var(--foreground)]">
                {plan.name}
              </p>

              <PricingAmount
                price={plan.price}
                originalPrice={plan.originalPrice}
                period={plan.period}
              />

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
