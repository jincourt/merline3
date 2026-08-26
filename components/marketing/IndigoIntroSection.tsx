import Link from "next/link";
import { MotionDiv } from "@/components/ui/motion";
import {
  TypewriterStatsColumn,
  type TypewriterStat,
} from "./TypewriterStatsColumn";

type IndigoIntroSectionProps = {
  id: string;
  title: string;
  description: string;
  cta?: {
    href: string;
    label: string;
    className?: string;
  };
  stats?: readonly TypewriterStat[];
  aside?: React.ReactNode;
  top?: boolean;
  center?: boolean;
};

export function IndigoIntroSection({
  id,
  title,
  description,
  cta,
  stats,
  aside,
  top = false,
  center = false,
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
      {cta ? (
        <div className="mt-6">
          <Link
            href={cta.href}
            className={cta.className ?? "btn-on-indigo"}
          >
            {cta.label}
          </Link>
        </div>
      ) : null}
    </div>
  );

  return (
    <section id={id} className="section-indigo w-full">
      <div
        className={`mx-auto max-w-[1200px] px-6 ${
          top ? "pb-12 pt-20 md:pb-20 md:pt-28" : "pb-12 pt-0 md:pb-16"
        }`}
      >
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
