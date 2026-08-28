import { Header } from "@/components/layout/Header";
import { HeaderIcon, PlusIcon } from "@/components/layout/HeaderIcons";
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
          title="Vendez rapidement grâce à nos agents"
          description="Publiez votre annonce en indiquant la commission. Les agents vous contactent lorsqu'ils ont un client intéressé."
          cta={{
            href: "/vendre",
            label: "Publier une annonce",
            className: "btn-vendre-submit btn-vendre-submit-lg",
            icon: (
              <HeaderIcon className="h-5 w-5">
                <PlusIcon />
              </HeaderIcon>
            ),
          }}
          aside={<HeroConversationAnimation />}
        />
        <ProductCatalog />
        <IndigoIntroSection
          id="agents"
          center
          variant="dark"
          title="Devenir un agent"
          description="Trouvez des opportunités adaptées à votre réseau et touchez une commission à chaque vente que vous apportez."
          cta={{
            href: "/guide",
            label: "Découvrir le guide",
            className: "btn-vendre-submit btn-vendre-submit-lg",
          }}
        />
      </main>
      <Footer indigo />
    </>
  );
}
