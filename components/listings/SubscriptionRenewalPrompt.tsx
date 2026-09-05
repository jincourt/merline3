"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmSubscriptionRenewal } from "@/app/actions";

export function SubscriptionRenewalPrompt() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const showPrompt = searchParams.get("subscription") === "1";

  if (!showPrompt) return null;

  function clearSubscriptionParam() {
    router.replace("/dashboard/annonces", { scroll: false });
  }

  function handleChoice(autoRenew: boolean) {
    startTransition(async () => {
      const result = await confirmSubscriptionRenewal(autoRenew);
      setFeedback(result.message);
      if (result.success) {
        setTimeout(clearSubscriptionParam, 1200);
      }
    });
  }

  if (feedback) {
    return (
      <p className="dashboard-feedback-banner dashboard-feedback-banner-success" role="status">
        {feedback}
      </p>
    );
  }

  return (
    <div className="subscription-renewal-prompt" role="region" aria-labelledby="subscription-renewal-title">
      <p id="subscription-renewal-title" className="subscription-renewal-prompt-title">
        Préférence de renouvellement
      </p>
      <p className="subscription-renewal-prompt-desc">
        Votre abonnement Merline Pro est actif. Souhaitez-vous qu&apos;il se renouvelle
        automatiquement chaque mois ?
      </p>
      <div className="subscription-renewal-prompt-actions">
        <button
          type="button"
          className="btn-primary subscription-renewal-prompt-btn"
          disabled={pending}
          onClick={() => handleChoice(true)}
        >
          {pending ? "Enregistrement…" : "Oui, renouveler automatiquement"}
        </button>
        <button
          type="button"
          className="subscription-renewal-prompt-btn subscription-renewal-prompt-btn-secondary"
          disabled={pending}
          onClick={() => handleChoice(false)}
        >
          Non, s&apos;arrêter à la fin de la période
        </button>
      </div>
    </div>
  );
}
