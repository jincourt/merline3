"use client";

import Link from "next/link";
import { useState } from "react";
import { MotionDiv } from "@/components/ui/motion";
import { PricingAmount } from "@/components/marketing/PricingAmount";
import {
  BOOST_PACKS,
  PLANS,
  type BoostPackId,
  type PlanId,
} from "@/lib/plans";

type Category = "pro" | "boost";

const merlineProPlans = (Object.keys(PLANS) as PlanId[]).map((id) => ({
  ...PLANS[id],
  cta: id === "publication" ? "Publier une annonce" : "S'abonner",
  href: id === "publication" ? "/vendre" : "/login?next=/tarifs",
  highlighted: id === "abonnement",
  badge: id === "abonnement" ? "Recommandé" : undefined,
  tagline:
    id === "publication"
      ? "Publiez à l'unité, sans engagement."
      : "Annonces illimitées pour les vendeurs actifs.",
}));

const boostPacks = (Object.keys(BOOST_PACKS) as BoostPackId[]).map((id) => ({
  ...BOOST_PACKS[id],
  cta: `Choisir ${BOOST_PACKS[id].duration}`,
  href: "/dashboard/annonces",
}));

const categories: { id: Category; label: string }[] = [
  { id: "pro", label: "Merline Pro" },
  { id: "boost", label: "Publicité" },
];

export function TarifsPageContent() {
  const [category, setCategory] = useState<Category>("pro");

  return (
    <>
      <section className="tarifs-hero">
        <div className="mx-auto max-w-[1200px] px-6 pb-6 pt-24 md:pb-8 md:pt-32">
          <div className="tarifs-hero-inner">
            <MotionDiv className="tarifs-hero-copy">
              <h1 className="tarifs-hero-title">Merline Pro</h1>
              <p className="tarifs-hero-lead">
                Publication à l&apos;unité ou abonnement mensuel. Boostez votre
                visibilité quand vous en avez besoin.
              </p>
            </MotionDiv>

            <div
              className="catalog-segment tarifs-segment"
              role="tablist"
              aria-label="Catégories de tarifs"
            >
              {categories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={category === item.id}
                  className={`catalog-segment-btn ${
                    category === item.id ? "catalog-segment-btn-active" : ""
                  }`}
                  onClick={() => setCategory(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="tarifs-plans">
        <div className="mx-auto max-w-[1200px] px-6 pb-20 md:pb-28">
          {category === "pro" ? (
            <div
              className="tarifs-grid tarifs-grid-pro"
              role="tabpanel"
              aria-label="Merline Pro"
            >
              {merlineProPlans.map((plan, index) => (
                <MotionDiv key={plan.id} delay={index * 0.06}>
                  <article
                    className={`tarifs-plan-card ${plan.highlighted ? "tarifs-plan-card-highlighted" : ""}`}
                  >
                    {plan.badge ? (
                      <span className="tarifs-plan-badge">{plan.badge}</span>
                    ) : null}

                    <h2 className="tarifs-plan-name">{plan.name}</h2>
                    <p className="tarifs-plan-tagline">{plan.tagline}</p>

                    <PricingAmount
                      price={plan.price}
                      originalPrice={plan.originalPrice}
                      period={plan.period}
                      size="lg"
                    />

                    <Link
                      href={plan.href}
                      className={
                        plan.highlighted
                          ? "tarifs-plan-cta tarifs-plan-cta-primary"
                          : "tarifs-plan-cta"
                      }
                    >
                      {plan.cta}
                    </Link>

                    <ul className="tarifs-plan-features">
                      {plan.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </article>
                </MotionDiv>
              ))}
            </div>
          ) : (
            <div
              className="tarifs-grid tarifs-grid-boost"
              role="tabpanel"
              aria-label="Publicité"
            >
              {boostPacks.map((pack, index) => (
                <MotionDiv key={pack.id} delay={index * 0.06}>
                  <article
                    className={`tarifs-plan-card ${pack.highlighted ? "tarifs-plan-card-highlighted" : ""}`}
                  >
                    {pack.badge ? (
                      <span className="tarifs-plan-badge">{pack.badge}</span>
                    ) : null}

                    <h2 className="tarifs-plan-name">{pack.name}</h2>
                    <p className="tarifs-plan-tagline">{pack.description}</p>

                    <PricingAmount
                      price={pack.price}
                      originalPrice={pack.originalPrice}
                      period={`/ ${pack.duration}`}
                      size="lg"
                    />

                    <p className="tarifs-plan-kicker">Boost x100</p>

                    <Link
                      href={pack.href}
                      className={
                        pack.highlighted
                          ? "tarifs-plan-cta tarifs-plan-cta-primary"
                          : "tarifs-plan-cta"
                      }
                    >
                      {pack.cta}
                    </Link>

                    <ul className="tarifs-plan-features">
                      {pack.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </article>
                </MotionDiv>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
