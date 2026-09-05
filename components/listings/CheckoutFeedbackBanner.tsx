"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SubscriptionRenewalPrompt } from "@/components/listings/SubscriptionRenewalPrompt";

export function CheckoutFeedbackBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<"published" | "error" | null>(null);
  const hasSubscriptionPrompt = searchParams.get("subscription") === "1";

  useEffect(() => {
    if (searchParams.get("published") === "1") {
      setMessage("published");
    } else if (searchParams.get("payment_error") === "1") {
      setMessage("error");
    } else {
      return;
    }

    if (!hasSubscriptionPrompt) {
      router.replace("/dashboard/annonces", { scroll: false });
    }
  }, [searchParams, router, hasSubscriptionPrompt]);

  if (message === "published") {
    return (
      <>
        <p className="dashboard-feedback-banner dashboard-feedback-banner-success" role="status">
          Paiement confirmé — votre annonce est publiée et visible par les agents.
        </p>
        <SubscriptionRenewalPrompt />
      </>
    );
  }

  if (message === "error") {
    return (
      <p className="dashboard-feedback-banner dashboard-feedback-banner-error" role="alert">
        Le paiement n&apos;a pas pu être confirmé. Réessayez depuis vos annonces en
        attente ou contactez le support.
      </p>
    );
  }

  return null;
}
