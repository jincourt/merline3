import { MotionDiv } from "@/components/ui/motion";
import { ListingForm } from "./ListingForm";

type VendrePageSectionProps = {
  isAuthenticated: boolean;
  profile: { email: string } | null;
};

export function VendrePageSection({
  isAuthenticated,
  profile,
}: VendrePageSectionProps) {
  return (
    <section className="section-light w-full">
      <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="vendre-page-grid">
          <MotionDiv className="vendre-page-intro">
            <h1 className="marketing-section-title">Publier une annonce</h1>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
            Décrivez votre bien, choisissez vos catégories et fixez votre
            commission.
            </p>
          </MotionDiv>

          <MotionDiv delay={0.05} className="vendre-page-form">
            <ListingForm
              mode="sell"
              flat
              isAuthenticated={isAuthenticated}
              profile={profile}
            />
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
