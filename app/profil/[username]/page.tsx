import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageMotion } from "@/components/layout/PageMotion";
import { CatalogCard } from "@/components/catalog/CatalogCard";
import { ProfileAvatar } from "@/components/profiles/ProfileAvatar";
import { ProfileContactDialog } from "@/components/profiles/ProfileContactDialog";
import { ProfileReviewForm, ProfileReviewStars } from "@/components/profiles/ProfileReviewForm";
import { ProfileReviewsSection } from "@/components/profiles/ProfileReviewsSection";
import { getUser } from "@/lib/auth";
import { getAgentDisplayName } from "@/lib/agent-profiles";
import { getProfileListings } from "@/lib/profile-listings";
import {
  getProfileHref,
  getProfileReviews,
  getPublicProfileByUsername,
  getUserReviewForProfile,
} from "@/lib/profile-reviews";
import { getVisibleContactInfo } from "@/lib/profile-contact";
import { createClient } from "@/lib/supabase/server";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const [profile, currentUser] = await Promise.all([
    getPublicProfileByUsername(supabase, username),
    getUser(),
  ]);

  if (!profile) {
    notFound();
  }

  const [listings, reviewSummary, existingReview] = await Promise.all([
    profile.profileType === "annonceur"
      ? getProfileListings(supabase, profile.id)
      : Promise.resolve([]),
    getProfileReviews(supabase, profile.id),
    currentUser && currentUser.id !== profile.id
      ? getUserReviewForProfile(supabase, profile.id, currentUser.id)
      : Promise.resolve(null),
  ]);

  const displayName = getAgentDisplayName(profile);
  const visibleContact = getVisibleContactInfo(profile);
  const canReview = Boolean(currentUser && currentUser.id !== profile.id);
  const isOwner = Boolean(currentUser && currentUser.id === profile.id);
  const loginHref = `/login?next=${encodeURIComponent(getProfileHref(profile.username))}`;

  return (
    <>
      <Header light />
      <main className="section-light min-h-[calc(100dvh-4rem)] flex-1">
        <div className="public-profile-page mx-auto w-full max-w-[42rem] px-6 pb-16 pt-24 md:pb-20 md:pt-32">
          <PageMotion>
            <header className="public-profile-head">
              <div className="public-profile-head-main">
                <ProfileAvatar
                  name={profile.name}
                  username={profile.username}
                  avatarUrl={profile.avatarUrl}
                  size="lg"
                  className="public-profile-avatar"
                />
                <div className="public-profile-head-info">
                  <h1 className="public-profile-name">{displayName}</h1>
                  <p className="public-profile-meta">@{profile.username}</p>
                  <ProfileReviewStars
                    rating={reviewSummary.averageRating}
                    count={reviewSummary.count}
                    singleStar
                    showReviewCount
                    countFormat="parens"
                    className="public-profile-rating"
                  />
                </div>
              </div>

              <div className="public-profile-head-actions">
                {isOwner ? (
                  <Link
                    href="/dashboard/parametres"
                    className="header-user-menu-trigger public-profile-contact-btn"
                  >
                    Modifier
                  </Link>
                ) : (
                  <ProfileContactDialog
                    ownerName={displayName}
                    contact={visibleContact}
                    profileId={profile.id}
                    isLoggedIn={Boolean(currentUser)}
                    loginHref={loginHref}
                    showMessageForm
                    filledTrigger
                  />
                )}
              </div>
            </header>
          </PageMotion>

          {profile.profileType === "agent" ? (
            <PageMotion delay={0.06}>
              <section className="public-profile-section">
                <div className="public-profile-section-head">
                  <h2 className="public-profile-section-title">Description</h2>
                </div>
                <p className="public-profile-description">
                  {profile.description || "Aucune description pour le moment."}
                </p>
              </section>
            </PageMotion>
          ) : null}

          {profile.profileType === "annonceur" ? (
            <PageMotion delay={0.06}>
              <section className="public-profile-section">
                {listings.length === 0 ? (
                  <div className="messages-empty public-profile-section-panel">
                    <p className="messages-empty-title">Aucune annonce</p>
                    <p className="messages-empty-desc">
                      Aucune annonce active pour le moment.
                    </p>
                  </div>
                ) : (
                  <div className="public-profile-listings">
                    {listings.map((listing, index) => (
                      <CatalogCard
                        key={`${listing.intent}-${listing.id}`}
                        listing={{
                          ...listing,
                          ownerAverageRating: reviewSummary.averageRating,
                          ownerReviewCount: reviewSummary.count,
                        }}
                        delay={index * 0.04}
                        variant="profile"
                      />
                    ))}
                  </div>
                )}
              </section>
            </PageMotion>
          ) : null}

          <PageMotion delay={0.1}>
            <section className="public-profile-section">
              <div className="public-profile-section-head">
                <h2 className="public-profile-section-title">Avis</h2>
                {canReview && !existingReview ? (
                  <ProfileReviewForm
                    profileId={profile.id}
                    username={profile.username}
                    variant="section-header"
                  />
                ) : null}
              </div>

              {reviewSummary.reviews.length === 0 ? (
                !(canReview && !existingReview) ? (
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
          </PageMotion>
        </div>
      </main>
      <Footer light />
    </>
  );
}
