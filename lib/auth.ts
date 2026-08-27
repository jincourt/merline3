import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("getUser failed:", error);
    return null;
  }
}

export async function getProfile() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, phone")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email ?? "",
      username:
        profile?.username ??
        user.user_metadata?.username ??
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        "",
      phone: profile?.phone ?? "",
    };
  } catch (error) {
    console.error("getProfile failed:", error);
    return null;
  }
}

export async function getSignupStatus(userId: string) {
  try {
    const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, terms_accepted_at")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("getSignupStatus query failed:", profileError);
  }

    const profileName = profile?.username?.trim() || null;
    const hasAcceptedTerms = !!profile?.terms_accepted_at;

    return {
      profileName,
      hasProfileName: !!profileName,
      hasAcceptedTerms,
      isComplete: !!profileName && hasAcceptedTerms,
    };
  } catch (error) {
    console.error("getSignupStatus failed:", error);
    return {
      profileName: null,
      hasProfileName: false,
      hasAcceptedTerms: false,
      isComplete: false,
    };
  }
}

export async function getProfileName(userId: string) {
  const status = await getSignupStatus(userId);
  return status.profileName;
}

export function sanitizeNextPath(next?: string | null) {
  if (!next?.startsWith("/") || next.startsWith("/login")) {
    return "/";
  }

  return next;
}

export function setupPath(next?: string | null) {
  const safeNext = sanitizeNextPath(next);
  return safeNext === "/"
    ? "/login/setup"
    : `/login/setup?next=${encodeURIComponent(safeNext)}`;
}

export async function authUserExistsByEmail(email: string) {
  try {
    const admin = createAdminClient();
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      console.error("authUserExistsByEmail failed:", error);
      return false;
    }

    return data.users.some(
      (user) => user.email?.trim().toLowerCase() === normalizedEmail,
    );
  } catch (error) {
    console.error("authUserExistsByEmail failed:", error);
    return false;
  }
}

export async function resolvePostAuthRedirect(next?: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "/login";

  const destination = sanitizeNextPath(next);
  const signupStatus = await getSignupStatus(user.id);

  if (signupStatus.isComplete) {
    return destination;
  }

  return setupPath(next);
}
