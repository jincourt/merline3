import { Header } from "@/components/layout/Header";
import { ProductCatalog } from "@/components/catalog/ProductCatalog";
import { IndigoIntroSection } from "@/components/marketing/IndigoIntroSection";
import { HeroConversationAnimation } from "@/components/marketing/HeroConversationAnimation";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Header indigo />
      <main>
        <IndigoIntroSection
          id="annonceurs"
          top
          title="Vous avez un objet ou un service à vendre ?"
          description="Publiez votre annonce en indiquant la commission que vous proposez, fixe ou en pourcentage. Les agents vous contactent lorsqu'ils ont un client intéressé."
          cta={{ href: "/vendre", label: "Publier une annonce" }}
          aside={<HeroConversationAnimation />}
        />
        <ProductCatalog />
        <IndigoIntroSection
          id="agents"
          center
          title="Devenir un agent"
          description="Trouvez des opportunités adaptées à votre réseau et touchez une commission à chaque vente que vous apportez."
          cta={{ href: "/guide", label: "Découvrir le guide" }}
        />
      </main>
      <Footer indigo />
    </>
  );
}
