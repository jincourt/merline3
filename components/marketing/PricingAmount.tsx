import { hasPricingDiscount } from "@/lib/plans";

export function PricingAmount({
  price,
  originalPrice,
  period,
  className = "",
}: {
  price: number;
  originalPrice?: number;
  period?: string;
  className?: string;
}) {
  const discounted = hasPricingDiscount(price, originalPrice);

  return (
    <div className={`pricing-amount ${className}`.trim()}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        {discounted ? (
          <span className="pricing-original-price">
            CHF {originalPrice}.-
            {period ? <span className="pricing-original-period">{period}</span> : null}
          </span>
        ) : null}
        <span className="text-3xl font-medium tracking-tight text-[var(--foreground)]">
          CHF {price}.-
        </span>
        {period ? (
          <span className="text-xs text-[var(--muted)]">{period}</span>
        ) : null}
      </div>
    </div>
  );
}
