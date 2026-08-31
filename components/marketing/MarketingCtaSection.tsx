import Link from "next/link";
import { MotionDiv } from "@/components/ui/motion";

export function MarketingCtaSection() {
  return (
    <section id="agents" className="section-light w-full border-t border-[var(--border)]">
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
        <MotionDiv className="mx-auto max-w-2xl text-center">
          <h2 className="marketing-section-title">
            Devenez agent.
            <br />
            Touchez une commission.
          </h2>
          <p className="marketing-section-lead mt-5">
            Trouvez des opportunités adaptées à votre réseau et touchez une
            commission à chaque vente que vous apportez.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/guide" className="btn-hero-filled inline-flex items-center">
              Découvrir le guide
            </Link>
            <Link href="/agents" className="btn-ghost btn-hero-ghost">
              Voir les agents
            </Link>
          </div>
        </MotionDiv>
      </div>
    </section>
  );
}
