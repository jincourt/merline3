export function ListingStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="listing-stat">
      <span className="listing-stat-label">{label}</span>
      <span className="listing-stat-value">{value}</span>
    </div>
  );
}
