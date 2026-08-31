import { MotionDiv } from "@/components/ui/motion";
import { HeroRotatingWord } from "./HeroRotatingWord";

export function HeroSection() {
  return (
    <section id="annonceurs" className="marketing-hero section-light w-full">
      <div className="mx-auto max-w-[1200px] px-6 pb-6 pt-24 md:pb-8 md:pt-32">
        <MotionDiv className="max-w-3xl">
          <h1 className="marketing-hero-title">
            Vendre <HeroRotatingWord />
            <br />
            grâce à nos agents
          </h1>
        </MotionDiv>
      </div>
    </section>
  );
}
