import { CatalogSection } from "./CatalogSection";
import { SiteContainer } from "@/components/layout/SiteContainer";
import { SiteCard } from "@/components/layout/SiteCard";
import { MotionDiv } from "@/components/ui/motion";

export function ProductCatalog() {
  return (
    <section id="catalogue" className="section-indigo w-full">
      <SiteContainer className="pb-24 pt-0 md:pb-32">
        <MotionDiv>
          <SiteCard>
            <CatalogSection pageSize={6} showSearch layout="grid" />
          </SiteCard>
        </MotionDiv>
      </SiteContainer>
    </section>
  );
}
