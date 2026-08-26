"use client";

import { MotionDiv } from "@/components/ui/motion";

const faqs = [
  {
    question: "Comment fonctionne la diffusion multi-plateformes ?",
    answer:
      "Vous remplissez une seule annonce sur Merline. Notre équipe la publie ensuite sur l'ensemble des plateformes pertinentes pour votre marché en Suisse — objets, services, vente ou achat.",
  },
  {
    question: "Puis-je changer de forfait en cours d'abonnement ?",
    answer:
      "Oui. Vous pouvez passer du mensuel à l'annuel à tout moment. Contactez notre équipe ou gérez votre abonnement depuis votre espace personnel.",
  },
  {
    question: "Le forfait ponctuel inclut-il la même diffusion ?",
    answer:
      "Oui. Le forfait ponctuel couvre une annonce avec la même diffusion complète que les abonnements. Seule la durée et le nombre d'annonces diffèrent.",
  },
  {
    question: "Y a-t-il des frais cachés ?",
    answer:
      "Non. Le prix affiché inclut la publication et la diffusion. Les crédits publicitaires inclus (50 CHF mensuel, 400 CHF annuel) sont indiqués clairement dans chaque forfait.",
  },
  {
    question: "Comment puis-je être contacté par votre équipe ?",
    answer:
      "Utilisez le formulaire de contact en bas de cette page. Laissez votre email et votre numéro — nous vous recontactons sous 24 heures ouvrables.",
  },
] as const;

export function FaqSection() {
  return (
    <section className="section-indigo relative overflow-hidden border-b border-white/10">
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
        <MotionDiv>
          <p className="text-xs font-medium uppercase tracking-wider text-white/60">
            FAQ
          </p>
          <h2 className="section-title mt-4 max-w-2xl text-white">
            Questions fréquentes
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            Tout ce que vous devez savoir sur nos forfaits et notre service.
          </p>
        </MotionDiv>

        <div className="mt-10 space-y-3">
          {faqs.map((faq, index) => (
            <MotionDiv key={faq.question} delay={index * 0.06}>
              <details className="group rounded-md border border-white/15 bg-white/5 open:bg-white/10">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-white marker:content-none md:text-base [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span
                    className="shrink-0 text-lg text-white/60 transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-white/75">
                  {faq.answer}
                </p>
              </details>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
