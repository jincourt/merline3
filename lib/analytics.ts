export const VISITOR_COOKIE = "ml_vid";
export const SESSION_COOKIE = "ml_sid";
export const ADMIN_COOKIE = "ml_admin";

export const VISITOR_MAX_AGE = 60 * 60 * 24 * 400;
export const SESSION_MAX_AGE = 60 * 30;
export const HEARTBEAT_MS = 20_000;

export const LISTING_PATH_RE =
  /^\/annonce\/(prod|buy)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

const BOT_RE =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse|pingdom|headless|wget|curl/i;

export type TrackedPageKind = "home" | "listing" | "other";

export type TrackedPage = {
  path: string;
  kind: TrackedPageKind;
  listingId?: string;
  listingSrc?: "prod" | "buy";
};

export function isLikelyBot(userAgent: string | null | undefined) {
  if (!userAgent) return false;
  return BOT_RE.test(userAgent);
}

export function shouldSkipTracking(path: string) {
  return (
    path.startsWith("/admin") ||
    path.startsWith("/api/") ||
    path.startsWith("/auth/") ||
    path.startsWith("/_next")
  );
}

export function normalizePath(raw: string) {
  const withoutQuery = raw.split("?")[0]?.split("#")[0] ?? "/";
  const trimmed = withoutQuery.trim() || "/";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (withSlash.length > 400) return withSlash.slice(0, 400);
  if (withSlash.length > 1 && withSlash.endsWith("/")) {
    return withSlash.slice(0, -1);
  }
  return withSlash;
}

export function parseTrackedPage(rawPath: string): TrackedPage {
  const path = normalizePath(rawPath);
  if (path === "/") {
    return { path, kind: "home" };
  }

  const listing = path.match(LISTING_PATH_RE);
  if (listing) {
    const listingSrc = listing[1] === "buy" ? "buy" : "prod";
    return {
      path,
      kind: "listing",
      listingSrc,
      listingId: listing[2],
    };
  }

  return { path, kind: "other" };
}

export function parseReferrerHost(referrer: string, origin: string) {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    if (url.origin === origin) return null;
    return url.hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

export function readUtm(search: string) {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const pick = (key: string) => {
    const value = params.get(key)?.trim();
    return value ? value.slice(0, 80) : null;
  };
  return {
    utm_source: pick("utm_source"),
    utm_medium: pick("utm_medium"),
    utm_campaign: pick("utm_campaign"),
  };
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function formatDuration(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  if (total < 10) return "< 10 s";
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  if (hours > 0) {
    return `${hours} h ${String(minutes).padStart(2, "0")} min`;
  }
  if (minutes > 0) {
    return rest > 0 ? `${minutes} min ${rest} s` : `${minutes} min`;
  }
  return `${rest} s`;
}

export function formatViewCount(count: number) {
  const safe = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const formatted = new Intl.NumberFormat("fr-CH").format(safe);
  return `${formatted} vue${safe === 1 ? "" : "s"}`;
}

export function formatFavoriteCount(count: number) {
  const safe = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const formatted = new Intl.NumberFormat("fr-CH").format(safe);
  return `${formatted} favori${safe === 1 ? "" : "s"}`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("fr-CH").format(value);
}

export function sessionSourceLabel(session: {
  utm_source?: string | null;
  referrer_host?: string | null;
}) {
  const utm = session.utm_source?.trim();
  if (utm) return utm;
  const host = session.referrer_host?.trim();
  if (host) return host;
  return "Direct";
}
