import { ContactForm } from "./ContactForm";
import { MotionDiv } from "@/components/ui/motion";
import { SectionShell } from "@/components/layout/SectionShell";

export function ContactSection() {
  return (
    <SectionShell id="contact" variant="dark" geo className="border-b-0">
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
        <MotionDiv className="mx-auto flex max-w-md flex-col items-center text-center">
          <p className="section-eyebrow">Contact</p>
          <h2 className="section-title mt-3 text-xl md:text-2xl">
            Être contacté par notre équipe
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:text-base">
            Laissez votre email et votre numéro — nous vous recontactons pour
            vous accompagner.
          </p>
          <ContactForm centered />
        </MotionDiv>
      </div>
    </SectionShell>
  );
}
