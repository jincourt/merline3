import { MotionDiv } from "@/components/ui/motion";
import { GroupForm } from "./GroupForm";
import type { PublicProfile } from "@/lib/agent-profiles";

type GroupPageSectionProps = {
  profiles: PublicProfile[];
  currentUserId: string;
};

export function GroupPageSection({ profiles, currentUserId }: GroupPageSectionProps) {
  return (
    <section className="section-light w-full">
      <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="vendre-page-grid">
          <MotionDiv className="vendre-page-intro">
            <h1 className="marketing-section-title">Créer un groupe</h1>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
              Donnez un titre à votre groupe, décrivez son objectif et invitez
              des membres de la communauté Merline.
            </p>
          </MotionDiv>

          <MotionDiv delay={0.05} className="vendre-page-form">
            <GroupForm profiles={profiles} currentUserId={currentUserId} />
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
