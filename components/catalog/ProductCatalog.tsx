import { Suspense } from "react";
import { CatalogSection } from "./CatalogSection";
import { SiteContainer } from "@/components/layout/SiteContainer";
import { MotionDiv } from "@/components/ui/motion";

function CatalogFallback() {
  return (
    <div className="py-16 text-center text-sm text-[var(--muted)]">
      Chargement du catalogue…
    </div>
  );
}

function CatalogPanel() {
  return (
    <MotionDiv>
      <CatalogSection pageSize={6} showSearch layout="grid" />
    </MotionDiv>
  );
}

export function ProductCatalog() {
  return (
    <section id="catalogue" className="section-light w-full">
      <SiteContainer className="py-16 md:py-24">
        <Suspense fallback={<CatalogFallback />}>
          <CatalogPanel />
        </Suspense>
      </SiteContainer>
    </section>
  );
}
