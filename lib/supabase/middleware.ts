import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

function isSignupComplete(profile: {
  username: string | null;
  terms_accepted_at: string | null;
} | null) {
  return !!profile?.username?.trim() && !!profile?.terms_accepted_at;
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

    if (pathname === "/login/setup" && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, terms_accepted_at")
        .eq("id", user.id)
        .maybeSingle();

      const signupComplete = isSignupComplete(profile);

      if (pathname === "/login" && signupComplete) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }

      if (pathname === "/login" && !signupComplete) {
        const url = request.nextUrl.clone();
        url.pathname = "/login/setup";
        const next = request.nextUrl.searchParams.get("next");
        if (next?.startsWith("/") && !next.startsWith("/login")) {
          url.searchParams.set("next", next);
        } else {
          url.searchParams.delete("next");
        }
        return NextResponse.redirect(url);
      }

      if (!signupComplete && pathname.startsWith("/dashboard")) {
        const url = request.nextUrl.clone();
        url.pathname = "/login/setup";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }

      if (pathname === "/login/setup" && signupComplete) {
        const url = request.nextUrl.clone();
        const next = request.nextUrl.searchParams.get("next");
        url.pathname =
          next?.startsWith("/") && !next.startsWith("/login") ? next : "/";
        url.searchParams.delete("next");
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    console.error("Supabase middleware error:", error);
    return NextResponse.next({ request });
  }

  return supabaseResponse;
}
