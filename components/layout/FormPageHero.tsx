import { MotionDiv } from "@/components/ui/motion";

export function FormPageHero({
  title,
  description,
  children,
  variant = "indigo",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  variant?: "indigo" | "light";
}) {
  const isLight = variant === "light";

  return (
    <section className={isLight ? "section-light w-full" : "section-indigo w-full"}>
      <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        <MotionDiv
          className={`mx-auto flex max-w-2xl flex-col ${
            isLight ? "items-start text-left" : "items-center text-center"
          }`}
        >
          <h1
            className={
              isLight
                ? "marketing-section-title"
                : "section-title text-xl text-white md:text-2xl"
            }
          >
            {title}
          </h1>
          <p
            className={`mt-4 max-w-xl leading-relaxed ${
              isLight
                ? "marketing-section-lead"
                : "text-base text-white/85 md:text-lg md:leading-relaxed"
            }`}
          >
            {description}
          </p>
        </MotionDiv>
        <MotionDiv delay={0.08} className="mx-auto mt-10 max-w-[720px]">
          {children}
        </MotionDiv>
      </div>
    </section>
  );
}
