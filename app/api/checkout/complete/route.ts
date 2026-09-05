import { NextRequest, NextResponse } from "next/server";
import { verifyCheckoutSessionAndActivate } from "@/lib/stripe-checkout";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id")?.trim();
  const origin = request.nextUrl.origin;
  const dashboardUrl = new URL("/dashboard/annonces", origin);

  if (!sessionId) {
    dashboardUrl.searchParams.set("payment_error", "1");
    return NextResponse.redirect(dashboardUrl);
  }

  try {
    const result = await verifyCheckoutSessionAndActivate(sessionId);

    if (!result.ok) {
      dashboardUrl.searchParams.set("payment_error", "1");
      return NextResponse.redirect(dashboardUrl);
    }

    dashboardUrl.searchParams.set("published", "1");
    if (result.planId === "abonnement") {
      dashboardUrl.searchParams.set("subscription", "1");
    }
    return NextResponse.redirect(dashboardUrl);
  } catch (error) {
    console.error("GET /api/checkout/complete:", error);
    dashboardUrl.searchParams.set("payment_error", "1");
    return NextResponse.redirect(dashboardUrl);
  }
}
