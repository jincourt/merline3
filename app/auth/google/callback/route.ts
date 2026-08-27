import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  getSignupStatus,
  sanitizeNextPath,
  setupPath,
} from "@/lib/auth";
import {
  decodeGoogleOAuthState,
  exchangeGoogleCode,
  fetchGoogleUser,
} from "@/lib/google-oauth";

async function createSessionForEmail(email: string) {
  const admin = createAdminClient();
  const supabase = await createClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email: normalizedEmail,
    });

  const tokenHash = linkData?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    throw new Error("Impossible de créer la session.");
  }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "email",
  });

  if (verifyError) {
    throw new Error("Impossible de créer la session.");
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const { next } = decodeGoogleOAuthState(state);

  if (oauthError || !code) {
    return NextResponse.redirect(`${origin}/login?error=google`);
  }

  try {
    const accessToken = await exchangeGoogleCode(code);
    const googleUser = await fetchGoogleUser(accessToken);
    const admin = createAdminClient();

    const { error: createError } = await admin.auth.admin.createUser({
      email: googleUser.email,
      email_confirm: true,
      user_metadata: googleUser.name
        ? { full_name: googleUser.name, name: googleUser.name }
        : undefined,
    });

    if (
      createError &&
      !createError.message.toLowerCase().includes("already") &&
      !createError.message.toLowerCase().includes("registered")
    ) {
      throw createError;
    }

    await createSessionForEmail(googleUser.email);
    revalidatePath("/", "layout");

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=google`);
    }

    const signupStatus = await getSignupStatus(user.id);
    const destination = signupStatus.isComplete
      ? sanitizeNextPath(next)
      : setupPath(next);

    return NextResponse.redirect(`${origin}${destination}`);
  } catch (error) {
    console.error("Google OAuth callback failed:", error);
    return NextResponse.redirect(`${origin}/login?error=google`);
  }
}
