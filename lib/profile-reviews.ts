import type { ProfileType } from "@/lib/profile-type";

export type ProfileReview = {
  id: string;
  profileId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type ProfileReviewSummary = {
  averageRating: number | null;
  count: number;
  reviews: ProfileReview[];
};

export type ProfileReviewRatingSummary = {
  averageRating: number | null;
  count: number;
};

export async function getProfileReviewSummariesForProfiles(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  profileIds: string[],
): Promise<Map<string, ProfileReviewRatingSummary>> {
  const result = new Map<string, ProfileReviewRatingSummary>(
    profileIds.map((id) => [id, { averageRating: null, count: 0 }]),
  );

  if (profileIds.length === 0) return result;

  const { data, error } = await supabase
    .from("profile_reviews")
    .select("profile_id, rating")
    .in("profile_id", profileIds);

  if (error || !data?.length) return result;

  const ratingsByProfile = new Map<string, number[]>();
  for (const row of data) {
    const ratings = ratingsByProfile.get(row.profile_id) ?? [];
    ratings.push(row.rating);
    ratingsByProfile.set(row.profile_id, ratings);
  }

  for (const [profileId, ratings] of ratingsByProfile) {
    const average =
      ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    result.set(profileId, {
      averageRating: Math.round(average * 10) / 10,
      count: ratings.length,
    });
  }

  return result;
}

export function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export async function getProfileReviews(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  profileId: string,
  limit = 12,
): Promise<ProfileReviewSummary> {
  const { data: reviews, error } = await supabase
    .from("profile_reviews")
    .select("id, profile_id, reviewer_id, rating, comment, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !reviews?.length) {
    return { averageRating: null, count: 0, reviews: [] };
  }

  const reviewerIds = [...new Set(reviews.map((row) => row.reviewer_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, username")
    .in("id", reviewerIds);

  const nameById = new Map(
    (profiles ?? []).map((profile) => [
      profile.id,
      profile.name?.trim() || profile.username?.trim() || "Utilisateur",
    ]),
  );

  const mapped: ProfileReview[] = reviews.map((row) => ({
    id: row.id,
    profileId: row.profile_id,
    reviewerId: row.reviewer_id,
    reviewerName: nameById.get(row.reviewer_id) ?? "Utilisateur",
    rating: row.rating,
    comment: row.comment?.trim() ?? "",
    createdAt: row.created_at,
  }));

  const { count } = await supabase
    .from("profile_reviews")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId);

  const totalCount = count ?? mapped.length;
  const averageRating =
    totalCount > 0
      ? Math.round(
          (mapped.reduce((sum, review) => sum + review.rating, 0) /
            mapped.length) *
            10,
        ) / 10
      : null;

  if (totalCount > mapped.length && mapped.length > 0) {
    const { data: allRatings } = await supabase
      .from("profile_reviews")
      .select("rating")
      .eq("profile_id", profileId);

    const avg =
      allRatings && allRatings.length > 0
        ? allRatings.reduce((sum, row) => sum + row.rating, 0) / allRatings.length
        : null;

    return {
      averageRating: avg ? Math.round(avg * 10) / 10 : null,
      count: totalCount,
      reviews: mapped,
    };
  }

  return {
    averageRating,
    count: totalCount,
    reviews: mapped,
  };
}

export async function getUserReviewForProfile(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  profileId: string,
  reviewerId: string,
) {
  const { data } = await supabase
    .from("profile_reviews")
    .select("id, rating, comment")
    .eq("profile_id", profileId)
    .eq("reviewer_id", reviewerId)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    rating: data.rating,
    comment: data.comment?.trim() ?? "",
  };
}

export type PublicProfilePage = {
  id: string;
  username: string;
  name: string;
  profileType: ProfileType;
  canton: string;
  npa: string;
  description: string;
  website: string;
  avatarUrl: string;
};

export async function getProfileByUserId(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
): Promise<PublicProfilePage | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id, username, name, profile_type, canton, npa, description, website, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (!data?.username?.trim()) return null;

  return {
    id: data.id,
    username: data.username.trim(),
    name: data.name?.trim() ?? "",
    profileType: (data.profile_type as ProfileType) ?? "annonceur",
    canton: data.canton?.trim() ?? "",
    npa: data.npa?.trim() ?? "",
    description: data.description?.trim() ?? "",
    website: data.website?.trim() ?? "",
    avatarUrl: data.avatar_url?.trim() ?? "",
  };
}

export async function getPublicProfileByUsername(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  username: string,
): Promise<PublicProfilePage | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id, username, name, profile_type, canton, npa, description, website, avatar_url")
    .ilike("username", username.trim())
    .not("profile_type", "is", null)
    .maybeSingle();

  if (!data?.username?.trim() || !data.profile_type) return null;

  return {
    id: data.id,
    username: data.username.trim(),
    name: data.name?.trim() ?? "",
    profileType: data.profile_type as ProfileType,
    canton: data.canton?.trim() ?? "",
    npa: data.npa?.trim() ?? "",
    description: data.description?.trim() ?? "",
    website: data.website?.trim() ?? "",
    avatarUrl: data.avatar_url?.trim() ?? "",
  };
}

export function getProfileHref(username: string) {
  return `/profil/${encodeURIComponent(username)}`;
}
