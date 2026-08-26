import { Suspense } from "react";
import { CatalogSection } from "./CatalogSection";
import { SiteContainer } from "@/components/layout/SiteContainer";
import { SiteCard } from "@/components/layout/SiteCard";
import { MotionDiv } from "@/components/ui/motion";

function CatalogFallback() {
  return (
    <SiteCard>
      <div className="py-16 text-center text-sm text-[var(--muted)]">
        Chargement du catalogue…
      </div>
    </SiteCard>
  );
}

function CatalogPanel() {
  return (
    <MotionDiv>
      <SiteCard>
        <CatalogSection pageSize={6} showSearch layout="grid" />
      </SiteCard>
    </MotionDiv>
  );
}

export function ProductCatalog() {
  return (
    <section id="catalogue" className="section-indigo w-full">
      <SiteContainer className="pb-24 pt-0 md:pb-32">
        <Suspense fallback={<CatalogFallback />}>
          <CatalogPanel />
        </Suspense>
      </SiteContainer>
    </section>
  );
}
