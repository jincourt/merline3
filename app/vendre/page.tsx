import { Header } from "@/components/layout/Header";
import { VendrePageSection } from "@/components/listings/VendrePageSection";
import { Footer } from "@/components/layout/Footer";
import { getProfile, getUser } from "@/lib/auth";

export default async function VendrePage() {
  const user = await getUser();
  const profile = user ? await getProfile() : null;

  return (
    <>
      <Header light gifIndigo />
      <main className="section-light flex-1">
        <VendrePageSection
          isAuthenticated={!!user}
          profile={
            profile
              ? {
                  email: profile.email,
                }
              : null
          }
        />
      </main>
      <Footer light />
    </>
  );
}
