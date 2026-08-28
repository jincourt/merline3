import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SiteContainer } from "@/components/layout/SiteContainer";
import { MotionDiv } from "@/components/ui/motion";
import { CatalogCard } from "@/components/catalog/CatalogCard";
import { ProfileAvatar } from "@/components/profiles/ProfileAvatar";
import { ProfileMessageForm } from "@/components/profiles/ProfileMessageForm";
import { ProfileReviewForm, ProfileReviewStars } from "@/components/profiles/ProfileReviewForm";
import { ProfileReviewsSection } from "@/components/profiles/ProfileReviewsSection";
import { getUser } from "@/lib/auth";
import { getAgentDisplayName } from "@/lib/agent-profiles";
import { getProfileListings } from "@/lib/profile-listings";
import { PROFILE_TYPE_LABELS } from "@/lib/profile-type";
import {
  getProfileHref,
  getProfileReviews,
  getPublicProfileByUsername,
  getUserReviewForProfile,
} from "@/lib/profile-reviews";
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
  const location = [profile.npa, profile.canton].filter(Boolean).join(" ");
  const canReview = Boolean(currentUser && currentUser.id !== profile.id);
  const isOwner = Boolean(currentUser && currentUser.id === profile.id);
  const loginHref = `/login?next=${encodeURIComponent(getProfileHref(profile.username))}`;

  return (
    <>
      <Header light gifIndigo />
      <main className="page-form flex-1">
        <SiteContainer className="pb-24 pt-10 md:pb-32 md:pt-14">
          <MotionDiv>
            <div className="public-profile-top">
              <div className="public-profile-header">
                <ProfileAvatar
                  name={profile.name}
                  username={profile.username}
                  avatarUrl={profile.avatarUrl}
                  size="lg"
                  className="public-profile-avatar-slot"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                    {PROFILE_TYPE_LABELS[profile.profileType]}
                  </p>
                  <h1 className="public-profile-name">{displayName}</h1>
                  <p className="public-profile-meta">@{profile.username}</p>
                  {location ? (
                    <p className="public-profile-meta">{location}</p>
                  ) : null}
                  <ProfileReviewStars
                    rating={reviewSummary.averageRating}
                    count={reviewSummary.count}
                    className="mt-3"
                  />
                </div>
              </div>
              <ProfileMessageForm
                profileId={profile.id}
                isOwner={isOwner}
                isLoggedIn={Boolean(currentUser)}
                loginHref={loginHref}
                variant="header"
              />
            </div>
          </MotionDiv>

          {profile.profileType === "agent" ? (
            <MotionDiv delay={0.06} className="mt-8">
              <section>
                <h2 className="public-profile-section-title">Description</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">
                  {profile.description || "Aucune description pour le moment."}
                </p>
                {profile.website ? (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm text-[var(--indigo)] hover:underline"
                  >
                    {profile.website}
                  </a>
                ) : null}
              </section>
            </MotionDiv>
          ) : null}

          {profile.profileType === "annonceur" ? (
            <MotionDiv delay={0.06} className="mt-8">
              <section className="public-profile-section">
                <h2 className="section-title">Annonces</h2>
                {listings.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--muted)]">
                    Aucune annonce active pour le moment.
                  </p>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {listings.map((listing, index) => (
                      <CatalogCard
                        key={`${listing.intent}-${listing.id}`}
                        listing={listing}
                        delay={index * 0.04}
                        variant="grid"
                      />
                    ))}
                  </div>
                )}
              </section>
            </MotionDiv>
          ) : null}

          <MotionDiv delay={0.1} className="mt-10">
            <section>
              {canReview && !existingReview ? (
                <ProfileReviewForm
                  profileId={profile.id}
                  username={profile.username}
                />
              ) : null}
              <ProfileReviewsSection
                summary={reviewSummary}
                titleClassName="public-profile-section-title"
              />
            </section>
          </MotionDiv>
        </SiteContainer>
      </main>
      <Footer light />
    </>
  );
}
