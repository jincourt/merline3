/**
 * Origin used for Stripe redirect URLs. In dev, prefer the incoming request
 * so redirects match whichever port Next.js is actually running on.
 */
export function getAppOrigin(request: Request): string {
  const requestOrigin = new URL(request.url).origin;
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim();

  if (process.env.NODE_ENV === "development") {
    return requestOrigin;
  }

  return configured || requestOrigin;
}
