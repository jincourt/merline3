export function SiteCard({
  children,
  className = "",
  variant = "elevated",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "elevated" | "outline";
}) {
  const variantClass =
    variant === "outline"
      ? "rounded-md border border-[var(--border)] bg-transparent p-6 md:p-8"
      : "section-light overflow-hidden rounded-md bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)] md:p-8";

  return <div className={`${variantClass} ${className}`.trim()}>{children}</div>;
}
