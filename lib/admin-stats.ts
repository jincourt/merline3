import { createAdminClient } from "@/lib/supabase/admin";
import { sessionSourceLabel } from "@/lib/analytics";

export type AdminOverview = {
  unique_visitors: number;
  total_sessions: number;
  sessions_24h: number;
  visitors_24h: number;
  avg_duration_seconds: number;
  home_sessions: number;
  home_visitors: number;
  listing_session_views: number;
  listings_count: number;
  listings_active: number;
  users_count: number;
  top_sources: { source: string; sessions: number }[];
  top_pages: { path: string; sessions: number }[];
};

export type AdminListingRow = {
  id: string;
  title: string;
  category: string;
  status: string;
  session_views: number;
  created_at: string;
  owner_username: string | null;
};

export type AdminUserRow = {
  id: string;
  username: string;
  name: string;
  profile_type: string | null;
  created_at: string;
  listings_count: number;
};

export type AdminSessionRow = {
  id: string;
  started_at: string;
  last_seen_at: string;
  duration_seconds: number;
  landing_path: string;
  source: string;
  pages: string[];
};

export type AdminVisitorRow = {
  id: string;
  username: string | null;
  user_id: string | null;
  first_seen_at: string;
  last_seen_at: string;
  session_count: number;
  total_duration_seconds: number;
  sessions: AdminSessionRow[];
};

export type AdminDashboardData = {
  overview: AdminOverview;
  listings: AdminListingRow[];
  users: AdminUserRow[];
  visitors: AdminVisitorRow[];
};

const EMPTY_OVERVIEW: AdminOverview = {
  unique_visitors: 0,
  total_sessions: 0,
  sessions_24h: 0,
  visitors_24h: 0,
  avg_duration_seconds: 0,
  home_sessions: 0,
  home_visitors: 0,
  listing_session_views: 0,
  listings_count: 0,
  listings_active: 0,
  users_count: 0,
  top_sources: [],
  top_pages: [],
};

function asNumber(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseOverview(raw: unknown): AdminOverview {
  if (!raw || typeof raw !== "object") return EMPTY_OVERVIEW;
  const data = raw as Record<string, unknown>;
  const sources = Array.isArray(data.top_sources) ? data.top_sources : [];
  const pages = Array.isArray(data.top_pages) ? data.top_pages : [];

  return {
    unique_visitors: asNumber(data.unique_visitors),
    total_sessions: asNumber(data.total_sessions),
    sessions_24h: asNumber(data.sessions_24h),
    visitors_24h: asNumber(data.visitors_24h),
    avg_duration_seconds: asNumber(data.avg_duration_seconds),
    home_sessions: asNumber(data.home_sessions),
    home_visitors: asNumber(data.home_visitors),
    listing_session_views: asNumber(data.listing_session_views),
    listings_count: asNumber(data.listings_count),
    listings_active: asNumber(data.listings_active),
    users_count: asNumber(data.users_count),
    top_sources: sources
      .map((item) => {
        const row = item as { source?: string; sessions?: number };
        return {
          source: row.source || "Direct",
          sessions: asNumber(row.sessions),
        };
      })
      .filter((row) => row.sessions > 0),
    top_pages: pages
      .map((item) => {
        const row = item as { path?: string; sessions?: number };
        return {
          path: row.path || "/",
          sessions: asNumber(row.sessions),
        };
      })
      .filter((row) => row.sessions > 0),
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const admin = createAdminClient();

  const [
    overviewResult,
    listingsResult,
    profilesResult,
    productOwnersResult,
    visitorsResult,
  ] = await Promise.all([
    admin.rpc("analytics_overview"),
    admin
      .from("products")
      .select("id, title, category, status, session_views, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(100),
    admin
      .from("profiles")
      .select("id, username, name, profile_type, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    admin.from("products").select("user_id"),
    admin
      .from("analytics_visitors")
      .select("id, user_id, username, first_seen_at, last_seen_at, session_count")
      .order("last_seen_at", { ascending: false })
      .limit(80),
  ]);

  if (overviewResult.error) {
    console.error("analytics_overview failed:", overviewResult.error.message);
  }

  type ListingRaw = {
    id: unknown;
    title: unknown;
    category: unknown;
    status: unknown;
    session_views?: unknown;
    created_at: unknown;
    user_id: unknown;
  };

  let listingsRaw: ListingRaw[] = listingsResult.data ?? [];
  if (listingsResult.error) {
    const fallback = await admin
      .from("products")
      .select("id, title, category, status, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(100);
    listingsRaw = fallback.data ?? [];
  }
  const profiles = profilesResult.data ?? [];
  const visitorsRaw = visitorsResult.data ?? [];

  const profileById = new Map(
    profiles.map((profile) => [profile.id as string, profile]),
  );

  const listingCountByUser = new Map<string, number>();
  for (const row of productOwnersResult.data ?? []) {
    const userId = row.user_id as string | null;
    if (!userId) continue;
    listingCountByUser.set(userId, (listingCountByUser.get(userId) ?? 0) + 1);
  }

  const listings: AdminListingRow[] = listingsRaw.map((item) => {
    const owner = item.user_id ? profileById.get(item.user_id as string) : null;
    return {
      id: item.id as string,
      title: (item.title as string) ?? "",
      category: (item.category as string) ?? "",
      status: (item.status as string) ?? "",
      session_views: asNumber(item.session_views),
      created_at: item.created_at as string,
      owner_username: owner?.username?.trim() || null,
    };
  });

  const users: AdminUserRow[] = profiles.map((profile) => ({
    id: profile.id as string,
    username: (profile.username as string | null)?.trim() || "—",
    name: (profile.name as string | null)?.trim() || "",
    profile_type: (profile.profile_type as string | null) ?? null,
    created_at: profile.created_at as string,
    listings_count: listingCountByUser.get(profile.id as string) ?? 0,
  }));

  const visitorIds = visitorsRaw.map((visitor) => visitor.id as string);
  let sessionsRaw: Record<string, unknown>[] = [];
  let pageviewsRaw: Record<string, unknown>[] = [];

  if (visitorIds.length > 0) {
    const { data: sessions } = await admin
      .from("analytics_sessions")
      .select(
        "id, visitor_id, started_at, last_seen_at, duration_seconds, landing_path, referrer_host, utm_source",
      )
      .in("visitor_id", visitorIds)
      .order("started_at", { ascending: false })
      .limit(400);

    sessionsRaw = (sessions ?? []) as Record<string, unknown>[];
    const sessionIds = sessionsRaw.map((session) => session.id as string);

    if (sessionIds.length > 0) {
      const { data: pageviews } = await admin
        .from("analytics_pageviews")
        .select("session_id, path, first_seen_at")
        .in("session_id", sessionIds)
        .order("first_seen_at", { ascending: true });
      pageviewsRaw = (pageviews ?? []) as Record<string, unknown>[];
    }
  }

  const pagesBySession = new Map<string, string[]>();
  for (const page of pageviewsRaw) {
    const sessionId = page.session_id as string;
    const path = (page.path as string) || "/";
    const list = pagesBySession.get(sessionId) ?? [];
    if (!list.includes(path)) list.push(path);
    pagesBySession.set(sessionId, list);
  }

  const sessionsByVisitor = new Map<string, AdminSessionRow[]>();
  for (const session of sessionsRaw) {
    const visitorId = session.visitor_id as string;
    const row: AdminSessionRow = {
      id: session.id as string,
      started_at: session.started_at as string,
      last_seen_at: session.last_seen_at as string,
      duration_seconds: asNumber(session.duration_seconds),
      landing_path: (session.landing_path as string) || "/",
      source: sessionSourceLabel({
        utm_source: session.utm_source as string | null,
        referrer_host: session.referrer_host as string | null,
      }),
      pages: pagesBySession.get(session.id as string) ?? [
        (session.landing_path as string) || "/",
      ],
    };
    const list = sessionsByVisitor.get(visitorId) ?? [];
    list.push(row);
    sessionsByVisitor.set(visitorId, list);
  }

  const visitors: AdminVisitorRow[] = visitorsRaw.map((visitor) => {
    const sessions = (sessionsByVisitor.get(visitor.id as string) ?? []).slice(0, 8);
    return {
      id: visitor.id as string,
      username: (visitor.username as string | null)?.trim() || null,
      user_id: (visitor.user_id as string | null) ?? null,
      first_seen_at: visitor.first_seen_at as string,
      last_seen_at: visitor.last_seen_at as string,
      session_count: asNumber(visitor.session_count),
      total_duration_seconds: sessions.reduce(
        (sum, session) => sum + session.duration_seconds,
        0,
      ),
      sessions,
    };
  });

  return {
    overview: parseOverview(overviewResult.data),
    listings,
    users,
    visitors,
  };
}
