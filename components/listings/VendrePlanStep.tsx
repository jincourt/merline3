"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveListingCheckout } from "@/app/actions";
import { AnimatedPlanCard } from "@/components/marketing/AnimatedPlanCard";
import { PricingAmount } from "@/components/marketing/PricingAmount";
import {
  BOOST_PACKS,
  PLANS,
  type BoostPackId,
  type PlanId,
} from "@/lib/plans";

type VendrePlanStepProps = {
  listingId: string;
  listingTitle: string;
  hasActivePro: boolean;
};

export function VendrePlanStep({
  listingId,
  listingTitle,
  hasActivePro,
}: VendrePlanStepProps) {
  const router = useRouter();
  const [planId, setPlanId] = useState<PlanId>(
    hasActivePro ? "abonnement" : "publication",
  );
  const [boostId, setBoostId] = useState<BoostPackId | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function toggleBoost(id: BoostPackId) {
    setBoostId((current) => (current === id ? null : id));
  }

  function handleContinue() {
    setError("");
    startTransition(async () => {
      const result = await saveListingCheckout(listingId, planId, boostId);
      if (!result.success) {
        setError(result.message);
        return;
      }
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  }

  return (
    <div className="space-y-8">
      <p className="text-center text-sm text-[var(--muted)]">
        Annonce : <span className="font-medium text-[var(--foreground)]">{listingTitle}</span>
      </p>

      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">Forfait Merline Pro</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {(Object.keys(PLANS) as PlanId[]).map((id) => {
            const plan = PLANS[id];
            const selected = planId === id;
            const included = hasActivePro && id === "abonnement";

            return (
              <button
                key={id}
                type="button"
                onClick={() => setPlanId(id)}
                className={`w-full text-left transition-opacity ${
                  selected ? "" : "opacity-80 hover:opacity-100"
                }`}
              >
                <AnimatedPlanCard
                  className={`pricing-card cursor-pointer ${
                    selected ? "pricing-card-highlighted ring-2 ring-[var(--indigo)]" : ""
                  }`}
                >
                  {included ? (
                    <span className="pricing-badge">Inclus</span>
                  ) : id === "abonnement" ? (
                    <span className="pricing-badge">Recommandé</span>
                  ) : null}

                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {plan.name}
                  </p>
                  {included ? (
                    <p className="mt-3 text-3xl font-medium tracking-tight text-[var(--foreground)]">
                      Inclus
                    </p>
                  ) : (
                    <PricingAmount
                      price={plan.price}
                      originalPrice={plan.originalPrice}
                      period={plan.period}
                    />
                  )}
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
                </AnimatedPlanCard>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">Publicité (optionnel)</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Boost x100 — multipliez la visibilité de votre annonce sur l&apos;application.
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {(Object.keys(BOOST_PACKS) as BoostPackId[]).map((id) => {
            const pack = BOOST_PACKS[id];
            const selected = boostId === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleBoost(id)}
                className={`w-full text-left transition-opacity ${
                  selected ? "" : "opacity-80 hover:opacity-100"
                }`}
              >
                <AnimatedPlanCard
                  className={`pricing-card cursor-pointer ${
                    selected
                      ? "pricing-card-highlighted ring-2 ring-[var(--indigo)]"
                      : pack.highlighted
                        ? "pricing-card-highlighted"
                        : ""
                  }`}
                >
                  {pack.badge ? (
                    <span className="pricing-badge">{pack.badge}</span>
                  ) : null}
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {pack.name}
                  </p>
                  <PricingAmount
                    price={pack.price}
                    originalPrice={pack.originalPrice}
                    period={`/ ${pack.duration}`}
                  />
                  <p className="mt-1 text-xs font-medium text-[var(--indigo)]">
                    Boost x100
                  </p>
                  <p className="mt-3 text-sm text-[var(--muted)]">{pack.description}</p>
                </AnimatedPlanCard>
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <p className="text-center text-sm text-[var(--error)]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          disabled={pending}
          className="btn-vendre-submit btn-vendre-submit-lg"
        >
          {pending ? "Enregistrement…" : "Suivant"}
        </button>
      </div>
    </div>
  );
}
