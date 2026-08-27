import { buildGoogleAuthUrl } from "@/lib/google-oauth";
import { sanitizeNextPath } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = sanitizeNextPath(searchParams.get("next"));

  try {
    const url = buildGoogleAuthUrl(next);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(`${origin}/login?error=google`);
  }
}
