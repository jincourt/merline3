import { TarifsPageContent } from "@/components/marketing/TarifsPageContent";
import { PricingFaq } from "@/components/marketing/PricingFaq";

export function TarifsPage() {
  return (
    <div className="tarifs-page section-light w-full">
      <TarifsPageContent />

      <section className="tarifs-faq-section border-t border-[var(--border)]">
        <div className="mx-auto max-w-[720px] px-6 py-20 md:py-28">
          <PricingFaq />
        </div>
      </section>
    </div>
  );
}
