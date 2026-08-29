import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/analytics";

const ADMIN_TTL_MS = 12 * 60 * 60 * 1000;

function getAdminPassword() {
  return process.env.MOT_DE_PASSE_ADMIN?.trim() ?? "";
}

function getSigningSecret() {
  const password = getAdminPassword();
  const extra = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 24) ?? "";
  return `${password}:${extra}:merline-admin`;
}

function sign(payload: string) {
  return createHmac("sha256", getSigningSecret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

export function isAdminPasswordConfigured() {
  return getAdminPassword().length > 0;
}

export function verifyAdminPassword(input: string) {
  const expected = getAdminPassword();
  if (!expected) return false;
  return safeEqual(input, expected);
}

export function createAdminToken() {
  const expiresAt = String(Date.now() + ADMIN_TTL_MS);
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function verifyAdminToken(token: string | undefined | null) {
  if (!token || !isAdminPasswordConfigured()) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;
  const expiry = Number(expiresAt);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;
  return safeEqual(signature, sign(expiresAt));
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(ADMIN_TTL_MS / 1000),
    secure: process.env.NODE_ENV === "production",
  };
}
