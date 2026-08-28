import { PackageOpen, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MotionDiv } from "@/components/ui/motion";

const audiences: {
  id: string;
  icon: LucideIcon;
  title: string;
  bullets: readonly string[];
}[] = [
  {
    id: "annonceurs",
    icon: PackageOpen,
    title: "Pour les annonceurs",
    bullets: [
      "Publiez votre annonce en quelques minutes",
      "Fixez la commission que vous êtes prêt à verser",
      "Notre réseau d'agents trouve l'acheteur idéal pour vous",
    ],
  },
  {
    id: "agents",
    icon: UsersRound,
    title: "Pour les agents",
    bullets: [
      "Parcourez le catalogue d'annonces disponibles",
      "Repérez les opportunités adaptées à votre réseau",
      "Touchez une commission à chaque vente que vous apportez",
    ],
  },
];

export function AudienceSection() {
  return (
    <section id="audience" className="section-indigo w-full border-t border-white/10">
      <div className="mx-auto max-w-[1200px] px-6 pb-16 pt-16 md:pb-20 md:pt-24">
        <MotionDiv className="mx-auto max-w-2xl text-center">
          <h2 className="section-title text-white">
            Une plateforme, deux rôles complémentaires
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/80 md:text-lg">
            Que vous vendiez un bien ou que vous apportiez des acheteurs, Merline
            connecte annonceurs et agents autour d&apos;une commission transparente.
          </p>
        </MotionDiv>

        <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
          {audiences.map((audience, index) => {
            const Icon = audience.icon;

            return (
              <MotionDiv key={audience.id} delay={index * 0.08}>
                <article className="audience-card h-full">
                  <div className="audience-card-icon" aria-hidden>
                    <Icon
                      className="h-16 w-16 md:h-20 md:w-20"
                      strokeWidth={1.25}
                    />
                  </div>
                  <h3 className="text-lg font-medium tracking-tight text-white md:text-xl">
                    {audience.title}
                  </h3>
                  <ul className="mt-4 flex-1 space-y-2 text-sm leading-relaxed text-white/80 md:text-base">
                    {audience.bullets.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span
                          className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/60"
                          aria-hidden
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </MotionDiv>
            );
          })}
        </div>
      </div>
    </section>
  );
}
