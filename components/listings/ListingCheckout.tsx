"use client";

import { useState } from "react";
import Image from "next/image";
import { Outfit } from "next/font/google";
import { PackageOpen } from "lucide-react";
import { MotionDiv } from "@/components/ui/motion";
import {
  BOOST_PACKS,
  PLANS,
  calculateCheckoutTotal,
  formatChf,
  type BoostPackId,
  type PlanId,
} from "@/lib/plans";

const checkoutNameFont = Outfit({
  subsets: ["latin"],
  weight: ["500"],
});

type ListingCheckoutSummaryProps = {
  listingTitle: string;
  listingPhoto: string | null;
  planId: PlanId;
  boostId: BoostPackId | null;
  skipPlanCharge?: boolean;
};

export function ListingCheckoutSummary({
  listingTitle,
  listingPhoto,
  planId,
  boostId,
  skipPlanCharge = false,
}: ListingCheckoutSummaryProps) {
  const plan = PLANS[planId];
  const boost = boostId ? BOOST_PACKS[boostId] : null;
  const total = calculateCheckoutTotal(planId, boostId, { skipPlanCharge });

  return (
    <aside className="pro-checkout-aside">
      <MotionDiv className="pro-checkout-profile">
        <div className="pro-checkout-avatar">
          {listingPhoto ? (
            <Image
              src={listingPhoto}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1023px) 128px, 176px"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/10 text-[#4f46e5]">
              <PackageOpen className="h-16 w-16 sm:h-20 sm:w-20" strokeWidth={1.25} aria-hidden />
            </div>
          )}
        </div>
        <h1 className={`pro-checkout-name ${checkoutNameFont.className}`}>
          {listingTitle}
        </h1>
        <div className="mt-6 space-y-2 text-center text-sm text-white/80">
          <p>
            {plan.name}
            {" · "}
            {skipPlanCharge ? "Inclus" : formatChf(plan.price)}
            {!skipPlanCharge ? plan.period : ""}
          </p>
          {boost ? (
            <p>
              {boost.name} · {formatChf(boost.price)}
            </p>
          ) : null}
          <p className="pt-2 text-base font-medium text-white">
            Total · {formatChf(total)}
          </p>
        </div>
      </MotionDiv>
    </aside>
  );
}

export function ListingCheckoutPayment({
  listingId,
  total,
}: {
  listingId: string;
  total: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = `/login?next=/vendre/paiement?listing=${listingId}`;
          return;
        }
        setError(data.error ?? "Paiement indisponible.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Impossible de démarrer le paiement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pro-checkout-main">
      <MotionDiv delay={0.08} className="pro-checkout-form-wrap w-full max-w-[360px]">
        <div className="pro-checkout-form w-full">
          <p className="pro-checkout-label">Paiement sécurisé</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Vous serez redirigé vers Stripe pour finaliser le paiement par carte,
            Twint ou autres moyens disponibles.
          </p>

          <div className="pro-checkout-amount mt-6">
            <span className="pro-checkout-currency">CHF</span>
            <span className="pro-checkout-input flex items-center px-0 text-2xl font-medium">
              {total}.-
            </span>
          </div>

          <button
            type="button"
            onClick={handlePay}
            disabled={loading}
            className="pro-checkout-submit mt-8"
          >
            {loading ? "Redirection…" : "Payer avec Stripe"}
          </button>

          {error ? (
            <p className="mt-3 text-xs text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </MotionDiv>

      <div className="pro-checkout-brand">
        <Image
          src="/merline.gif"
          alt=""
          width={24}
          height={24}
          className="pro-checkout-merline-gif"
          unoptimized
        />
      </div>
    </main>
  );
}
