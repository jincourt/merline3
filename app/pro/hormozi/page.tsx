import type { Metadata } from "next";
import Image from "next/image";
import { Outfit } from "next/font/google";
import { MotionDiv } from "@/components/ui/motion";
import { ProCheckoutForm } from "@/components/pro/ProCheckoutForm";
import { ProCheckoutStarIcon } from "@/components/pro/ProCheckoutStars";

const proNameFont = Outfit({
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "Alex Hormozi — Paiement",
  robots: { index: false, follow: false },
};

export default function ProAlexHormoziPage() {
  return (
    <div className="pro-checkout min-h-screen">
      <aside className="pro-checkout-aside">
        <MotionDiv className="pro-checkout-profile">
          <div className="pro-checkout-avatar">
            <Image
              src="/profile/alex.jpg"
              alt="Alex Hormozi"
              fill
              className="object-cover"
              sizes="(max-width: 1023px) 128px, 176px"
              priority
            />
          </div>
          <h1 className={`pro-checkout-name ${proNameFont.className}`}>
            Alex Hormozi <br /> vous invite à payer
          </h1>
        </MotionDiv>
        <p className="pro-checkout-rating">
          <span>4.8/5</span>
          <ProCheckoutStarIcon className="pro-checkout-rating-star" />
          <span>(24)</span>
        </p>
      </aside>

      <main className="pro-checkout-main">
        <MotionDiv delay={0.08} className="pro-checkout-form-wrap w-full max-w-[360px]">
          <ProCheckoutForm />
        </MotionDiv>
        
        <div className="pro-checkout-brand">
          <Image
            src="/merline.gif"
            alt=""
            width={24}
            height={24}
            className="pro-checkout-merline-gif"
            unoptimized
          />
          
        </div>
      </main>
    </div>
  );
}
