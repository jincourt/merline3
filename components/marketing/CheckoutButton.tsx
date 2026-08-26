"use client";

import { useState } from "react";
import type { PlanId } from "@/lib/plans";

export function CheckoutButton({
  planId,
  label,
  className,
}: {
  planId: PlanId;
  label: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = `/connexion?next=/paiement?plan=${planId}`;
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
    <div>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={className}
      >
        {loading ? "Redirection…" : label}
      </button>
      {error ? (
        <p className="mt-2 text-xs text-[var(--error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
