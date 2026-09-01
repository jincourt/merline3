type ListingPricingItem = {
  label: string;
  value: string;
};

export function ListingPricing({ items }: { items: ListingPricingItem[] }) {
  if (!items.length) return null;

  return (
    <section className="listing-pricing form-stripe-section">
      <div className="form-stripe-row">
        {items.map((item) => (
          <div key={item.label} className="form-stripe-field listing-pricing-item">
            <span className="field-label">{item.label}</span>
            <p className="listing-pricing-value">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
