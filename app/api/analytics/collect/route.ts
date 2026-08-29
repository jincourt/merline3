import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  isLikelyBot,
  isUuid,
  parseReferrerHost,
  parseTrackedPage,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  shouldSkipTracking,
  VISITOR_COOKIE,
  VISITOR_MAX_AGE,
} from "@/lib/analytics";

type CollectBody = {
  visitorId?: string;
  sessionId?: string;
  path?: string;
  referrer?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  isHeartbeat?: boolean;
};

function cookieOptions(maxAge: number) {
  return {
    path: "/",
    maxAge,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  };
}

function clip(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export async function POST(request: Request) {
  let body: CollectBody = {};

  try {
    body = (await request.json()) as CollectBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  if (isLikelyBot(userAgent)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const page = parseTrackedPage(typeof body.path === "string" ? body.path : "/");
  if (shouldSkipTracking(page.path)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const visitorId =
    typeof body.visitorId === "string" && isUuid(body.visitorId)
      ? body.visitorId
      : crypto.randomUUID();
  const sessionId =
    typeof body.sessionId === "string" && isUuid(body.sessionId)
      ? body.sessionId
      : crypto.randomUUID();

  const origin = new URL(request.url).origin;
  const referrer = clip(body.referrer, 500);
  const referrerHost = referrer ? parseReferrerHost(referrer, origin) : null;

  let userId: string | null = null;
  let username: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();
      username = profile?.username?.trim() || null;
    }
  } catch {
    // Tracking must never depend on auth being available.
  }

  try {
    const admin = createAdminClient();
    await admin.rpc("analytics_ingest", {
      payload: {
        visitor_id: visitorId,
        session_id: sessionId,
        path: page.path,
        page_kind: page.kind,
        listing_id: page.listingId ?? null,
        listing_src: page.listingSrc ?? null,
        referrer,
        referrer_host: referrerHost,
        utm_source: clip(body.utm_source, 80),
        utm_medium: clip(body.utm_medium, 80),
        utm_campaign: clip(body.utm_campaign, 80),
        user_agent: clip(userAgent, 400),
        user_id: userId,
        username,
        is_heartbeat: Boolean(body.isHeartbeat),
      },
    });
  } catch (error) {
    console.error("analytics ingest failed:", error);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(VISITOR_COOKIE, visitorId, cookieOptions(VISITOR_MAX_AGE));
  response.cookies.set(SESSION_COOKIE, sessionId, cookieOptions(SESSION_MAX_AGE));
  return response;
}
