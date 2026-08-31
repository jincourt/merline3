"use client";

import Link from "next/link";
import { HeaderMobileMenu } from "./HeaderMobileMenu";
import { HeaderUserMenu } from "./HeaderUserMenu";

export function HeaderNav({
  indigo = false,
  light = false,
  loggedIn = false,
  username,
  hideAuthLink = false,
}: {
  indigo?: boolean;
  light?: boolean;
  loggedIn?: boolean;
  username?: string;
  hideAuthLink?: boolean;
}) {
  const linkClass = indigo
    ? "text-white/80 hover:text-white"
    : light
      ? "text-[#425466] hover:text-[#0a2540]"
      : "text-[var(--muted)] hover:text-[var(--foreground)]";

  if (hideAuthLink) {
    return <div className="flex min-w-0 flex-1 items-center justify-end" />;
  }

  if (loggedIn) {
    return (
      <div className="flex min-w-0 flex-1 items-center justify-end">
        <div className="hidden md:block">
          <HeaderUserMenu username={username} indigo={indigo} light={light} />
        </div>
        <div className="md:hidden">
          <HeaderMobileMenu username={username} indigo={indigo} light={light} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 items-center justify-end">
      <Link
        href="/login"
        className={`header-auth-link ${linkClass}`}
      >
        Mon compte
      </Link>
    </div>
  );
}
