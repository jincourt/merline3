import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SiteContainer } from "@/components/layout/SiteContainer";
import { MotionDiv } from "@/components/ui/motion";
import { ListingDescription } from "@/components/listings/ListingDescription";
import { ListingMessageForm } from "@/components/listings/ListingMessageForm";
import { fetchPublicListing, formatListingPrice } from "@/lib/catalog";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getListingTypeLabel, sourceToIntent, type ListingSource } from "@/lib/types";

function isListingSource(value: string): value is ListingSource {
  return value === "prod" || value === "buy";
}

export default async function AnnoncePage({
  params,
}: {
  params: Promise<{ src: string; id: string }>;
}) {
  const { src, id } = await params;

  if (!isListingSource(src)) {
    notFound();
  }

  const supabase = await createClient();
  const [listing, user] = await Promise.all([
    fetchPublicListing(supabase, src, id),
    getUser(),
  ]);

  if (!listing) {
    notFound();
  }

  const image = listing.photos?.find((photo) => photo?.startsWith("http"));
  const intent = sourceToIntent(src);
  const typeLabel = getListingTypeLabel(listing.listing_type);
  const isOwner = Boolean(user && listing.user_id && user.id === listing.user_id);
  const loginHref = `/login?next=${encodeURIComponent(`/annonce/${src}/${id}`)}`;
  const priceLabel = formatListingPrice(listing);
  const amountLabel = intent === "sell" ? "Commission" : "Budget";

  return (
    <>
      <Header light gifIndigo />
      <main className="page-form flex-1">
        <SiteContainer className="pb-24 pt-10 md:pb-32 md:pt-14">
          <MotionDiv>
            <Link
              href="/#catalogue"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              ← Retour au catalogue
            </Link>
          </MotionDiv>

          <div className="mt-6 grid gap-6 md:grid-cols-2 md:gap-8 md:items-start">
            <MotionDiv delay={0.06}>
              <div className="overflow-hidden rounded-md border border-[var(--border)] bg-white">
                {image ? (
                  <div className="relative aspect-square">
                    <Image
                      src={image}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-[var(--surface-elevated)]">
                    <span className="text-sm text-[var(--muted-dim)]">Aucune image</span>
                  </div>
                )}
              </div>
            </MotionDiv>

            <MotionDiv delay={0.12}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="catalog-badge">{typeLabel}</span>
                <span className="text-xs text-[var(--muted-dim)]">{listing.category}</span>
              </div>

              <h1 className="mt-3 text-2xl font-medium tracking-tight">{listing.title}</h1>
              <p className="mt-3 text-sm text-[var(--muted)]">{listing.address}</p>

              <ListingMessageForm
                listingId={listing.id}
                src={src}
                isOwner={isOwner}
                isLoggedIn={Boolean(user)}
                loginHref={loginHref}
                variant="inline"
                leading={
                  <span className="btn-ghost pointer-events-none shrink-0 gap-2 px-5">
                    <span className="text-[var(--muted)]">{amountLabel}</span>
                    <span className="font-semibold">{priceLabel}</span>
                  </span>
                }
              />

              <ListingDescription description={listing.description} />
            </MotionDiv>
          </div>
        </SiteContainer>
      </main>
      <Footer light />
    </>
  );
}
