import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MotionDiv } from "@/components/ui/motion";
import { CatalogBreadcrumb } from "@/components/catalog/CatalogBreadcrumb";
import { ListingDescription } from "@/components/listings/ListingDescription";
import { ListingPageHeader } from "@/components/listings/ListingPageHeader";
import { ListingMessageForm } from "@/components/listings/ListingMessageForm";
import { ListingPricing } from "@/components/listings/ListingPricing";
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
      const reviewsPromise = getProfileReviews(supabase, ownerProfile.id);

      if (src !== "prod") {
        [reviewSummary, existingReview] = await Promise.all([
          reviewsPromise,
          user && user.id !== ownerProfile.id
            ? getUserReviewForProfile(supabase, ownerProfile.id, user.id)
            : Promise.resolve(null),
        ]);
      } else {
        reviewSummary = await reviewsPromise;
      }
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

  const pricingItems =
    intent === "sell"
      ? [
          ...(listing.price != null && salePriceLabel && salePriceValue
            ? [{ label: salePriceLabel, value: salePriceValue }]
            : []),
          { label: amountLabel, value: priceLabel },
        ]
      : [{ label: amountLabel, value: priceLabel }];

  return (
    <>
      <Header light />
      <main className="section-light min-h-[calc(100dvh-4rem)] flex-1">
        <div className="listing-page mx-auto w-full max-w-[1200px] px-6 pb-24 pt-24 md:pb-32 md:pt-28">
          <MotionDiv>
            <CatalogBreadcrumb
              listingType={listing.listing_type}
              category={listing.category}
              className="catalog-breadcrumb-page"
            />
          </MotionDiv>

          <div className="listing-page-grid">
            <MotionDiv delay={0.06} className="listing-page-media-col">
              <div className="listing-page-media">
                {image ? (
                  <div className="relative aspect-[4/3] lg:aspect-square">
                    <Image
                      src={image}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1023px) 100vw, 50vw"
                      priority
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-[var(--surface-elevated)] lg:aspect-square">
                    <span className="text-sm text-[var(--muted-dim)]">Aucune image</span>
                  </div>
                )}
              </div>
            </MotionDiv>

            <MotionDiv delay={0.12} className="listing-page-details">
              <div className="form-stripe listing-page-details-stripe">
                <div className="listing-page-intro">
                  <ListingPageHeader
                    title={listing.title}
                    sessionViews={listing.session_views}
                    initialFavoriteCount={listing.favorite_count}
                    listingId={listing.id}
                    src={src}
                    initialFavorited={isFavorited}
                    isLoggedIn={Boolean(user)}
                    loginHref={loginHref}
                  />

                  {listing.address?.trim() ? (
                    <p className="listing-page-address">{listing.address}</p>
                  ) : null}
                </div>

                <ListingPricing items={pricingItems} />

                <section className="listing-contact-block form-stripe-section">
                  {ownerProfile ? (
                    <ListingOwnerPreview
                      name={ownerProfile.name}
                      username={ownerProfile.username}
                      avatarUrl={ownerProfile.avatarUrl}
                      averageRating={src === "prod" ? reviewSummary.averageRating : null}
                      reviewCount={src === "prod" ? reviewSummary.count : 0}
                      actions={
                        src === "prod" && !isOwner && ownerContact ? (
                          <ProfileContactDialog
                            ownerName={ownerDisplayName}
                            contact={ownerContact}
                            profileId={ownerProfile.id}
                            isLoggedIn={Boolean(user)}
                            loginHref={loginHref}
                            showMessageForm
                            filledTrigger
                          />
                        ) : undefined
                      }
                    />
                  ) : null}

                  {src === "buy" ? (
                    <ListingMessageForm
                      listingId={listing.id}
                      src={src}
                      isOwner={isOwner}
                      isLoggedIn={Boolean(user)}
                      loginHref={loginHref}
                      variant="inline"
                    />
                  ) : isOwner ? (
                    <p className="listing-page-owner-note">
                      C&apos;est votre annonce. Les messages arriveront dans votre espace.
                    </p>
                  ) : null}
                </section>
              </div>
            </MotionDiv>
          </div>

          <MotionDiv delay={0.18}>
            <ListingDescription description={listing.description} />
          </MotionDiv>

          {ownerProfile && src !== "prod" ? (
            <MotionDiv delay={0.24}>
              <section className="public-profile-section listing-reviews-wrap">
                <div className="public-profile-section-head">
                  <h2 className="public-profile-section-title">Avis</h2>
                  {canReviewOwner && !existingReview ? (
                    <ProfileReviewForm
                      profileId={ownerProfile.id}
                      username={ownerProfile.username}
                      listingId={listing.id}
                      listingSrc={src}
                      variant="section-header"
                    />
                  ) : null}
                </div>

                {reviewSummary.reviews.length === 0 ? (
                  !(canReviewOwner && !existingReview) ? (
                    <div className="messages-empty public-profile-section-panel">
                      <p className="messages-empty-title">Aucun avis</p>
                      <p className="messages-empty-desc">
                        Aucun avis pour le moment.
                      </p>
                    </div>
                  ) : null
                ) : (
                  <div className="messages-panel public-profile-reviews-panel">
                    <ProfileReviewsSection summary={reviewSummary} showTitle={false} />
                  </div>
                )}
              </section>
            </MotionDiv>
          ) : null}
        </div>
      </main>
      <Footer light />
    </>
  );
}
