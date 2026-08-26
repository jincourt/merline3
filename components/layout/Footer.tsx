import Link from "next/link";
import { MotionDiv } from "@/components/ui/motion";

export function Footer({
  light = false,
  indigo = false,
}: {
  light?: boolean;
  indigo?: boolean;
}) {
  if (light) {
    return (
      <footer className="border-t border-[rgba(0,0,0,0.08)] bg-white">
        <MotionDiv className="mx-auto max-w-[1200px] px-6 py-12 text-center">
          <p className="text-xs text-[#71717a]">
            © {new Date().getFullYear()} Merline
          </p>
        </MotionDiv>
      </footer>
    );
  }

  if (indigo) {
    return (
      <footer className="section-indigo border-t border-white/10">
        <MotionDiv className="mx-auto max-w-[1200px] px-6 pb-8 pt-12 text-center">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Merline
          </p>
        </MotionDiv>
      </footer>
    );
  }

  return (
    <footer className="section-dark border-t border-[var(--border)]">
      <MotionDiv className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Merline</p>
            <p className="mt-4 max-w-sm text-sm text-[var(--muted)]">
              Trouvez vos partenaires sur le web et entraidez-vous dans la vente.
            </p>
          </div>
       

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-dim)]">
              Menu
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              <li>
                <Link href="/vendre" className="hover:text-[var(--foreground)]">
                  Vendre
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 h-px bg-[var(--border)]" />
        <p className="mt-8 text-xs text-[var(--muted-dim)]">
          © {new Date().getFullYear()} Merline
        </p>
      </MotionDiv>
    </footer>
  );
}
