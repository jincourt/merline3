import { GeometricBackground } from "@/components/ui/GeometricBackground";

type SectionShellProps = {
  id?: string;
  variant?: "dark" | "light";
  geo?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function SectionShell({
  id,
  variant = "dark",
  geo = false,
  className = "",
  children,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={`section-shell section-${variant} relative overflow-hidden border-b ${className}`}
    >
      {variant === "dark" && geo ? <GeometricBackground /> : null}
      <div className="relative">{children}</div>
    </section>
  );
}
