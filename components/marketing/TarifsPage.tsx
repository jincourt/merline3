import Link from "next/link";
import { AnimatedPlanCard } from "./AnimatedPlanCard";
import { MotionDiv } from "@/components/ui/motion";
import { SectionShell } from "@/components/layout/SectionShell";
import { BOOST_PACKS, PLANS, type BoostPackId, type PlanId } from "@/lib/plans";

const merlineProPlans = (Object.keys(PLANS) as PlanId[]).map((id) => ({
  ...PLANS[id],
  cta: id === "publication" ? "Publier une annonce" : "S'abonner",
  href: id === "publication" ? "/vendre" : "/login?next=/tarifs",
  highlighted: id === "abonnement",
  badge: id === "abonnement" ? "Recommandé" : undefined,
}));

const boostPacks = (Object.keys(BOOST_PACKS) as BoostPackId[]).map((id) => ({
  ...BOOST_PACKS[id],
  cta: `Choisir ${BOOST_PACKS[id].duration}`,
}));

export function TarifsPage() {
  return (
    <>
      <SectionShell variant="dark" geo className="border-b-0">
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
          <MotionDiv>
            <h1 className="hero-title">Merline Pro</h1>
            
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)] md:text-lg md:leading-relaxed">
              Publiez votre annonce en indiquant la commission. Les agents vous
              contactent lorsqu&apos;ils ont un client intéressé.
            </p>
          </MotionDiv>

          <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-5">
            {merlineProPlans.map((plan, index) => (
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
                    CHF {plan.price}.-
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

                <Link
                  href={plan.href}
                  className={`mt-6 block text-center ${plan.highlighted ? "btn-primary" : "btn-ghost"}`}
                >
                  {plan.cta}
                </Link>
              </AnimatedPlanCard>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell id="publicite" variant="light" className="scroll-mt-24">
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
          <MotionDiv>
            <h2 className="section-title max-w-2xl">
              Boostez votre annonce sur l&apos;application.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)] md:text-base">
              Multipliez votre visibilité par 100 et placez votre annonce en tête du
              catalogue Merline. Choisissez la durée qui correspond à votre objectif de
              vente.
            </p>
          </MotionDiv>

          <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
            {boostPacks.map((pack, index) => (
              <AnimatedPlanCard
                key={pack.name}
                delay={index * 0.1}
                className={`pricing-card ${"highlighted" in pack && pack.highlighted ? "pricing-card-highlighted" : ""}`}
              >
                {"badge" in pack && pack.badge ? (
                  <span className="pricing-badge">{pack.badge}</span>
                ) : null}

                <p className="text-sm font-medium text-[var(--foreground)]">
                  {pack.name}
                </p>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-medium tracking-tight text-[var(--foreground)]">
                    CHF {pack.price}.-
                  </span>
                  <span className="text-xs text-[var(--muted)]">/ {pack.duration}</span>
                </div>

                <p className="mt-1 text-xs font-medium text-[var(--indigo)]">
                  Boost x100
                </p>

                <p className="mt-3 text-sm text-[var(--muted)]">{pack.description}</p>

                <ul className="mt-5 space-y-2">
                  {pack.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-xs text-[var(--muted)]"
                    >
                      <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--indigo)]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/dashboard/annonces"
                  className={`mt-6 block text-center ${"highlighted" in pack && pack.highlighted ? "btn-primary" : "btn-ghost"}`}
                >
                  {pack.cta}
                </Link>
              </AnimatedPlanCard>
            ))}
          </div>
        </div>
      </SectionShell>
    </>
  );
}
