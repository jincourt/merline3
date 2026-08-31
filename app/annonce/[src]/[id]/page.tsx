import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SiteContainer } from "@/components/layout/SiteContainer";
import { MotionDiv } from "@/components/ui/motion";
import { CatalogBreadcrumb } from "@/components/catalog/CatalogBreadcrumb";
import { ListingDescription } from "@/components/listings/ListingDescription";
import { ListingPageHeader } from "@/components/listings/ListingPageHeader";
import { ListingMessageForm } from "@/components/listings/ListingMessageForm";
import { ListingStat } from "@/components/listings/ListingStat";
import { ProfileContactDialog } from "@/components/profiles/ProfileContactDialog";
import { ListingOwnerPreview } from "@/components/profiles/ListingOwnerPreview";
import { ProfileReviewForm } from "@/components/profiles/ProfileReviewForm";
import { ProfileReviewsSection } from "@/components/profiles/ProfileReviewsSection";
import {
  fetchPublicListing,
  formatListingPrice,
  formatCatalogSalePrice,
  getCatalogSalePriceLabel,
} from "@/lib/catalog";
import { isListingFavorited } from "@/lib/favorites";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  getProfileByUserId,
  getProfileReviews,
  getUserReviewForProfile,
  type ProfileReviewSummary,
} from "@/lib/profile-reviews";
import { getAgentDisplayName } from "@/lib/agent-profiles";
import { getVisibleContactInfo } from "@/lib/profile-contact";
import { sourceToIntent, type ListingSource } from "@/lib/types";

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

  const isFavorited = user
    ? await isListingFavorited(supabase, user.id, id, src)
    : false;

  const image = listing.photos?.find((photo) => photo?.startsWith("http"));
  const intent = sourceToIntent(src);
  const isOwner = Boolean(user && listing.user_id && user.id === listing.user_id);
  const loginHref = `/login?next=${encodeURIComponent(`/annonce/${src}/${id}`)}`;
  const priceLabel = formatListingPrice(listing);
  const amountLabel = intent === "sell" ? "Commission" : "Budget";
  const salePriceLabel =
    intent === "sell" ? getCatalogSalePriceLabel(listing) : null;
  const salePriceValue =
    intent === "sell" ? formatCatalogSalePrice(listing) : null;

  let ownerProfile = null;
  let reviewSummary: ProfileReviewSummary = {
    averageRating: null,
    count: 0,
    reviews: [],
  };
  let existingReview = null;

  if (listing.user_id) {
    ownerProfile = await getProfileByUserId(supabase, listing.user_id);

    if (ownerProfile) {
      [reviewSummary, existingReview] = await Promise.all([
        getProfileReviews(supabase, ownerProfile.id),
        user && user.id !== ownerProfile.id
          ? getUserReviewForProfile(supabase, ownerProfile.id, user.id)
          : Promise.resolve(null),
      ]);
    }
  }

  const canReviewOwner = Boolean(
    ownerProfile && user && user.id !== ownerProfile.id,
  );
  const ownerContact = ownerProfile
    ? getVisibleContactInfo(ownerProfile, { includeAnnonceurDescription: true })
    : null;
  const ownerDisplayName = ownerProfile
    ? getAgentDisplayName(ownerProfile)
    : "";

  return (
    <>
      <Header light gifIndigo />
      <main className="section-light flex-1">
        <SiteContainer className="pb-24 pt-8 md:pb-32 md:pt-12">
          <MotionDiv>
            <CatalogBreadcrumb
              listingType={listing.listing_type}
              category={listing.category}
            />
          </MotionDiv>

          <div className="listing-page-grid">
            <MotionDiv delay={0.06}>
              <div className="listing-page-media">
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
              <ListingPageHeader
                title={listing.title}
                category={listing.category}
                sessionViews={listing.session_views}
                initialFavoriteCount={listing.favorite_count}
                listingId={listing.id}
                src={src}
                initialFavorited={isFavorited}
                isLoggedIn={Boolean(user)}
                loginHref={loginHref}
              />

              <p className="listing-page-address">{listing.address}</p>

              <div className="listing-stat-grid">
                <ListingStat label={amountLabel} value={priceLabel} />
                {intent === "sell" && listing.price != null && salePriceLabel && salePriceValue ? (
                  <ListingStat label={salePriceLabel} value={salePriceValue} />
                ) : null}
              </div>

              <div className="listing-contact-block">
                {ownerProfile ? (
                  <ListingOwnerPreview
                    name={ownerProfile.name}
                    username={ownerProfile.username}
                    avatarUrl={ownerProfile.avatarUrl}
                    averageRating={src === "prod" ? reviewSummary.averageRating : null}
                    reviewCount={src === "prod" ? reviewSummary.count : 0}
                  />
                ) : null}

                <ListingMessageForm
                  listingId={listing.id}
                  src={src}
                  isOwner={isOwner}
                  isLoggedIn={Boolean(user)}
                  loginHref={loginHref}
                  variant="inline"
                  trailing={
                    src === "prod" && ownerContact && !isOwner ? (
                      <ProfileContactDialog
                        ownerName={ownerDisplayName}
                        contact={ownerContact}
                      />
                    ) : null
                  }
                />
              </div>

              <ListingDescription description={listing.description} />
            </MotionDiv>
          </div>

          {ownerProfile ? (
            <MotionDiv delay={0.18} className="listing-reviews-wrap">
              <section className="listing-reviews-section">
                {canReviewOwner && !existingReview ? (
                  <ProfileReviewForm
                    profileId={ownerProfile.id}
                    username={ownerProfile.username}
                    listingId={listing.id}
                    listingSrc={src}
                  />
                ) : null}

                <ProfileReviewsSection
                  summary={reviewSummary}
                  title="Avis sur l'annonceur"
                  stacked
                />
              </section>
            </MotionDiv>
          ) : null}
        </SiteContainer>
      </main>
      <Footer light />
    </>
  );
}
