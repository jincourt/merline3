import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

function getSignupState(profile: {
  username: string | null;
  terms_accepted_at: string | null;
  profile_type: string | null;
  agent_setup_completed: boolean | null;
} | null) {
  const hasProfileName = !!profile?.username?.trim();
  const hasAcceptedTerms = !!profile?.terms_accepted_at;
  const hasProfileType = !!profile?.profile_type;
  const isAgent = profile?.profile_type === "agent";
  const hasAgentSetup = !isAgent || !!profile?.agent_setup_completed;

  return {
    hasProfileName,
    hasAcceptedTerms,
    hasProfileType,
    isAgent,
    hasAgentSetup,
    isComplete: hasProfileName && hasAcceptedTerms && hasProfileType && hasAgentSetup,
  };
}

function setupPath(next: string | null) {
  return next ? `/login/setup?next=${encodeURIComponent(next)}` : "/login/setup";
}

function setupTypePath(next: string | null) {
  return next
    ? `/login/setup/type?next=${encodeURIComponent(next)}`
    : "/login/setup/type";
}

function setupAgentPath(next: string | null) {
  return next
    ? `/login/setup/agent?next=${encodeURIComponent(next)}`
    : "/login/setup/agent";
}

function incompleteSetupPath(
  next: string | null,
  status: ReturnType<typeof getSignupState>,
) {
  if (status.hasProfileName && status.hasAcceptedTerms && !status.hasProfileType) {
    return setupTypePath(next);
  }

  if (
    status.hasProfileName &&
    status.hasAcceptedTerms &&
    status.hasProfileType &&
    status.isAgent &&
    !status.hasAgentSetup
  ) {
    return setupAgentPath(next);
  }

  return setupPath(next);
}

function resolveNextParam(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  return next?.startsWith("/") && !next.startsWith("/login") ? next : null;
}

function redirectToPath(request: NextRequest, path: string) {
  const url = request.nextUrl.clone();
  const target = new URL(path, request.url);
  url.pathname = target.pathname;
  url.search = target.search;
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  const supabaseEnv = getSupabaseEnv();

  if (!supabaseEnv) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      supabaseEnv.url,
      supabaseEnv.anonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isSetupPage = pathname === "/login/setup";
    const isSetupTypePage = pathname === "/login/setup/type";
    const isSetupAgentPage = pathname === "/login/setup/agent";

    if (pathname === "/connexion") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/dashboard") && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if ((isSetupPage || isSetupTypePage || isSetupAgentPage) && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, terms_accepted_at, profile_type, agent_setup_completed")
        .eq("id", user.id)
        .maybeSingle();

      const signup = getSignupState(profile);
      const next = resolveNextParam(request);

      if (pathname === "/login" && signup.isComplete) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }

      if (pathname === "/login" && !signup.isComplete) {
        return redirectToPath(
          request,
          incompleteSetupPath(next, signup),
        );
      }

      if (!signup.isComplete && pathname.startsWith("/dashboard")) {
        return redirectToPath(
          request,
          incompleteSetupPath(pathname, signup),
        );
      }

      if ((isSetupPage || isSetupTypePage || isSetupAgentPage) && signup.isComplete) {
        const url = request.nextUrl.clone();
        url.pathname = next ?? "/";
        url.search = "";
        return NextResponse.redirect(url);
      }

      if (
        isSetupPage &&
        signup.hasProfileName &&
        signup.hasAcceptedTerms &&
        !signup.hasProfileType
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/login/setup/type";
        if (next) {
          url.searchParams.set("next", next);
        } else {
          url.search = "";
        }
        return NextResponse.redirect(url);
      }

      if (
        isSetupTypePage &&
        (!signup.hasProfileName || !signup.hasAcceptedTerms)
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/login/setup";
        if (next) {
          url.searchParams.set("next", next);
        } else {
          url.search = "";
        }
        return NextResponse.redirect(url);
      }

      if (
        isSetupAgentPage &&
        (!signup.hasProfileName ||
          !signup.hasAcceptedTerms ||
          !signup.hasProfileType ||
          !signup.isAgent)
      ) {
        return redirectToPath(request, incompleteSetupPath(next, signup));
      }

      if (
        isSetupTypePage &&
        signup.hasProfileName &&
        signup.hasAcceptedTerms &&
        signup.hasProfileType &&
        signup.isAgent &&
        !signup.hasAgentSetup
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/login/setup/agent";
        if (next) {
          url.searchParams.set("next", next);
        } else {
          url.search = "";
        }
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    console.error("Supabase middleware error:", error);
    return NextResponse.next({ request });
  }

  return supabaseResponse;
}
