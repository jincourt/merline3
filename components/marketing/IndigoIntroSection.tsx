import Link from "next/link";
import { MotionDiv } from "@/components/ui/motion";
import {
  TypewriterStatsColumn,
  type TypewriterStat,
} from "./TypewriterStatsColumn";

type CtaButton = {
  href: string;
  label: string;
  className?: string;
  icon?: React.ReactNode;
};

type IndigoIntroSectionProps = {
  id: string;
  title: string;
  description: string;
  cta?: CtaButton;
  secondaryCta?: CtaButton;
  stats?: readonly TypewriterStat[];
  aside?: React.ReactNode;
  top?: boolean;
  center?: boolean;
  variant?: "indigo" | "dark";
};

export function IndigoIntroSection({
  id,
  title,
  description,
  cta,
  secondaryCta,
  stats,
  aside,
  top = false,
  center = false,
  variant = "indigo",
}: IndigoIntroSectionProps) {
  const content = (
    <div
      className={`flex flex-col justify-center ${
        center ? "items-center text-center" : ""
      }`}
    >
      <h2 className="section-title text-xl text-white md:text-2xl">{title}</h2>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 md:text-lg md:leading-relaxed">
        {description}
      </p>
      {cta || secondaryCta ? (
        <div
          className={`mt-6 flex flex-wrap items-center gap-3 ${
            center ? "justify-center" : ""
          }`}
        >
          {cta ? (
            <Link
              href={cta.href}
              className={`inline-flex items-center gap-2.5 ${cta.className ?? "btn-on-indigo"}`}
            >
              {cta.icon}
              {cta.label}
            </Link>
          ) : null}
          {secondaryCta ? (
            <Link
              href={secondaryCta.href}
              className={`inline-flex items-center gap-2.5 ${secondaryCta.className ?? "btn-on-indigo-ghost"}`}
            >
              {secondaryCta.icon}
              {secondaryCta.label}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const sectionClass = variant === "dark" ? "section-dark" : "section-indigo";
  const paddingClass = top
    ? "pb-12 pt-20 md:pb-20 md:pt-28"
    : variant === "dark"
      ? "pb-16 pt-16 md:pb-20 md:pt-24"
      : "pb-12 pt-0 md:pb-16";

  return (
    <section id={id} className={`${sectionClass} w-full`}>
      <div className={`mx-auto max-w-[1200px] px-6 ${paddingClass}`}>
        {stats ? (
          <div className="grid gap-10 md:grid-cols-2 md:items-stretch md:gap-12">
            <MotionDiv>{content}</MotionDiv>
            <MotionDiv delay={0.1}>
              <TypewriterStatsColumn stats={stats} variant="indigo" />
            </MotionDiv>
          </div>
        ) : aside ? (
          <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-12">
            <MotionDiv>
              <div className="flex flex-col justify-center">{content}</div>
            </MotionDiv>
            <MotionDiv
              delay={0.1}
              className="flex w-full items-center justify-center md:justify-end lg:justify-center"
            >
              {aside}
            </MotionDiv>
          </div>
        ) : (
          <MotionDiv
            className={`flex max-w-xl flex-col justify-center ${
              center ? "mx-auto items-center" : ""
            }`}
          >
            {content}
          </MotionDiv>
        )}
      </div>
    </section>
  );
}

export type { TypewriterStat };
