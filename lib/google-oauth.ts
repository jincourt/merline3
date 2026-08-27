import { sanitizeNextPath } from "@/lib/auth";

function getSiteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function getGoogleRedirectUri() {
  return `${getSiteOrigin()}/auth/google/callback`;
}

export function encodeGoogleOAuthState(next?: string | null) {
  const payload = { next: sanitizeNextPath(next) };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeGoogleOAuthState(state: string | null) {
  if (!state) return { next: "/" as const };

  try {
    const parsed = JSON.parse(
      Buffer.from(state, "base64url").toString("utf8"),
    ) as { next?: string };

    return { next: sanitizeNextPath(parsed.next) };
  } catch {
    return { next: "/" as const };
  }
}

export function buildGoogleAuthUrl(next?: string | null) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID manquant.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state: encodeGoogleOAuthState(next),
    access_type: "online",
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

type GoogleUserInfo = {
  email?: string;
  name?: string;
  given_name?: string;
};

export async function exchangeGoogleCode(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Identifiants Google OAuth manquants.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  const data = (await response.json()) as GoogleTokenResponse;

  if (!response.ok || !data.access_token) {
    throw new Error(data.error ?? "Échange de code Google impossible.");
  }

  return data.access_token;
}

export async function fetchGoogleUser(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = (await response.json()) as GoogleUserInfo;

  if (!response.ok || !data.email) {
    throw new Error("Impossible de récupérer le profil Google.");
  }

  return {
    email: data.email.trim().toLowerCase(),
    name: data.name?.trim() || data.given_name?.trim() || "",
  };
}
