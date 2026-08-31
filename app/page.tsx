import { Header } from "@/components/layout/Header";
import { ProductCatalog } from "@/components/catalog/ProductCatalog";
import { HeroSection } from "@/components/marketing/HeroSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { MarketingCtaSection } from "@/components/marketing/MarketingCtaSection";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Header light />
      <main className="section-light">
        <HeroSection />
        <ProductCatalog />
        <FeaturesSection />
        <MarketingCtaSection />
      </main>
      <Footer light />
    </>
  );
}
