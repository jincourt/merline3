import { MotionDiv } from "@/components/ui/motion";

export function FormPageHero({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="section-indigo w-full">
      <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        <MotionDiv className="mx-auto flex max-w-lg flex-col items-center text-center">
          <h1 className="section-title text-xl text-white md:text-2xl">{title}</h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
            {description}
          </p>
        </MotionDiv>
        <MotionDiv delay={0.08} className="mx-auto mt-10 max-w-[720px]">
          <div className="section-light overflow-hidden rounded-2xl bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)] md:p-8">
            {children}
          </div>
        </MotionDiv>
      </div>
    </section>
  );
}
