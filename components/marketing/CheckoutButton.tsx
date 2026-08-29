"use client";

import Link from "next/link";
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
  const href = planId === "publication" ? "/vendre" : "/tarifs";

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
