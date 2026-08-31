import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FormPageHero } from "@/components/layout/FormPageHero";
import { VendrePlanStep } from "@/components/listings/VendrePlanStep";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function VendrePlanPage({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string }>;
}) {
  const { listing: listingId } = await searchParams;
  const user = await getUser();

  if (!user) {
    redirect(`/login?next=/vendre/plan${listingId ? `?listing=${listingId}` : ""}`);
  }

  if (!listingId) {
    redirect("/vendre");
  }

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("products")
    .select("id, title, status, user_id")
    .eq("id", listingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!listing) {
    redirect("/vendre");
  }

  if (listing.status === "active") {
    redirect("/dashboard/annonces");
  }

  if (listing.status === "pending_payment") {
    redirect(`/vendre/paiement?listing=${listingId}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("merline_pro_active")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <Header light gifIndigo />
      <main className="section-light flex-1">
        <FormPageHero
          variant="light"
          title="Choisissez votre forfait"
          description="Sélectionnez un plan Merline Pro et, si vous le souhaitez, une option publicitaire pour booster votre annonce."
        >
          <div className="form-shell">
            <VendrePlanStep
              listingId={listing.id}
              listingTitle={listing.title}
              hasActivePro={profile?.merline_pro_active === true}
            />
          </div>
        </FormPageHero>
      </main>
      <Footer light />
    </>
  );
}
