import { MotionDiv } from "@/components/ui/motion";
import {
  AgentFeatureIcon,
  CommissionFeatureIcon,
  MessageFeatureIcon,
  PublishFeatureIcon,
} from "./FeatureIcons";

const features = [
  {
    title: "Publiez en minutes",
    description: "Annonce en ligne en quelques clics.",
    Icon: PublishFeatureIcon,
  },
  {
    title: "Votre commission",
    description: "Vous fixez le montant, sans surprise.",
    Icon: CommissionFeatureIcon,
  },
  {
    title: "Agents qualifiés",
    description: "Ils trouvent l'acheteur dans leur réseau.",
    Icon: AgentFeatureIcon,
  },
  {
    title: "Messages intégrés",
    description: "Négociation et suivi au même endroit.",
    Icon: MessageFeatureIcon,
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="section-light w-full border-t border-[var(--border)]">
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
        <MotionDiv className="max-w-lg features-section-head">
          <h2 className="marketing-section-title">
            Tout ce qu&apos;il faut pour vendre plus vite.
          </h2>
        </MotionDiv>

        <ul className="feature-grid">
          {features.map((feature, index) => {
            const Icon = feature.Icon;

            return (
              <li key={feature.title}>
                <MotionDiv delay={index * 0.05} className="card-cube h-full">
                  <article className="feature-card card-cube-face">
                    <div className="feature-card-body">
                      <div className="feature-card-icon" aria-hidden="true">
                        <Icon className="feature-card-icon-svg" />
                      </div>
                    </div>
                    <div className="feature-card-copy">
                      <h3 className="feature-card-title">{feature.title}</h3>
                      <p className="feature-card-desc">{feature.description}</p>
                    </div>
                  </article>
                </MotionDiv>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
