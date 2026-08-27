import { Header } from "@/components/layout/Header";
import { ListingForm } from "@/components/listings/ListingForm";
import { Footer } from "@/components/layout/Footer";
import { FormPageHero } from "@/components/layout/FormPageHero";
import { getProfile, getUser } from "@/lib/auth";

export default async function VendrePage() {
  const user = await getUser();
  const profile = user ? await getProfile() : null;

  return (
    <>
      <Header indigo />
      <main className="section-indigo flex-1">
        <FormPageHero
          title="Publiez votre annonce"
          description="Publiez votre annonce en indiquant la commission que vous proposez. Les agents vous contactent lorsqu'ils ont un client intéressé."
        >
          <ListingForm
            mode="sell"
            isAuthenticated={!!user}
            profile={
              profile
                ? {
                    email: profile.email,
                  }
                : null
            }
          />
        </FormPageHero>
      </main>
      <Footer indigo />
    </>
  );
}
