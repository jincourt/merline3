"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function CheckoutFeedbackBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<"published" | "error" | null>(null);

  useEffect(() => {
    if (searchParams.get("published") === "1") {
      setMessage("published");
    } else if (searchParams.get("payment_error") === "1") {
      setMessage("error");
    } else {
      return;
    }

    router.replace("/dashboard/annonces", { scroll: false });
  }, [searchParams, router]);

  if (message === "published") {
    return (
      <p
        className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        role="status"
      >
        Paiement confirmé — votre annonce est publiée et visible par les agents.
      </p>
    );
  }

  if (message === "error") {
    return (
      <p
        className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
        role="alert"
      >
        Le paiement n&apos;a pas pu être confirmé. Réessayez depuis vos annonces en
        attente ou contactez le support.
      </p>
    );
  }

  return null;
}
