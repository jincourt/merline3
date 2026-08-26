export function SiteCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`section-light overflow-hidden rounded-md bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)] md:p-8 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
