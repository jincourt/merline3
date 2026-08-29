import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/analytics";
import {
  adminCookieOptions,
  createAdminToken,
  isAdminPasswordConfigured,
  verifyAdminPassword,
} from "@/lib/admin-auth";

const attempts = new Map<string, { count: number; resetAt: number }>();

function getIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function rateLimited(ip: string) {
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || current.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 8;
}

export async function POST(request: Request) {
  if (!isAdminPasswordConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Mot de passe admin non configuré." },
      { status: 500 },
    );
  }

  const ip = getIp(request);
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Trop de tentatives. Réessayez plus tard." },
      { status: 429 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json(
      { ok: false, error: "Mot de passe incorrect." },
      { status: 401 },
    );
  }

  attempts.delete(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createAdminToken(), adminCookieOptions());
  return response;
}
