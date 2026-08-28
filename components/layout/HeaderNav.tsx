"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderIcon, MessagesIcon, PlusIcon, UserIcon } from "./HeaderIcons";
import { HeaderMobileMenu } from "./HeaderMobileMenu";
import { HeaderUserMenu } from "./HeaderUserMenu";

const messagesNav = { href: "/dashboard/messages", label: "Messages", icon: MessagesIcon } as const;

function getMessagesHref(loggedIn: boolean) {
  return loggedIn ? messagesNav.href : `/login?next=${encodeURIComponent(messagesNav.href)}`;
}

function getIconButtonClass(indigo: boolean, light: boolean, active = false) {
  const base = "header-icon-btn";
  const variant = indigo
    ? "header-icon-btn-indigo"
    : light
      ? "header-icon-btn-light"
      : "";
  const state = active ? "header-icon-btn-active" : "";
  return [base, variant, state].filter(Boolean).join(" ");
}

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
  const pathname = usePathname();

  const linkClass = indigo
    ? "text-white/80 hover:text-white"
    : light
      ? "text-[#52525b] hover:text-[#0a0a0a]"
      : "text-[var(--muted)] hover:text-[var(--foreground)]";

  const activeClass = indigo
    ? "font-medium text-white"
    : light
      ? "font-medium text-[#0a0a0a]"
      : "font-medium text-[var(--foreground)]";

  const publishButtonClass = indigo
    ? "btn-vendre-submit header-publish-btn shrink-0"
    : "btn-primary header-publish-btn shrink-0";

  const publishIconClass = indigo
    ? "header-icon-btn header-icon-btn-indigo header-icon-btn-publish"
    : light
      ? "header-icon-btn header-icon-btn-light header-icon-btn-publish-primary"
      : "header-icon-btn header-icon-btn-publish-primary";

  const messagesActive = pathname.startsWith(messagesNav.href);
  const MessagesIconComponent = messagesNav.icon;
  const messagesHref = getMessagesHref(loggedIn);

  return (
    <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:gap-6">
      <div className="hidden min-w-0 items-center justify-end gap-5 md:flex md:gap-6">
        <nav className="flex items-center gap-5 md:gap-6" aria-label="Navigation du compte">
          <Link
            href={messagesHref}
            className={`header-nav-link ${messagesActive ? activeClass : linkClass}`}
          >
            <HeaderIcon>
              <MessagesIconComponent />
            </HeaderIcon>
            {messagesNav.label}
          </Link>
        </nav>

        <Link href="/vendre" className={publishButtonClass}>
          <HeaderIcon className="h-4 w-4">
            <PlusIcon />
          </HeaderIcon>
          Publier une annonce
        </Link>
      </div>

      <div className="flex items-center gap-2 md:hidden">
        <Link
          href={messagesHref}
          className={getIconButtonClass(indigo, light, messagesActive)}
          aria-label={messagesNav.label}
          title={messagesNav.label}
        >
          <HeaderIcon className="h-5 w-5">
            <MessagesIconComponent />
          </HeaderIcon>
        </Link>

        <Link
          href="/vendre"
          className={publishIconClass}
          aria-label="Publier une annonce"
          title="Publier une annonce"
        >
          <HeaderIcon className="h-5 w-5">
            <PlusIcon />
          </HeaderIcon>
        </Link>

        {!hideAuthLink ? (
          loggedIn ? (
            <HeaderMobileMenu username={username} indigo={indigo} light={light} />
          ) : (
            <Link
              href="/login"
              className={getIconButtonClass(indigo, light)}
              aria-label="Mon compte"
              title="Mon compte"
            >
              <HeaderIcon className="h-5 w-5">
                <UserIcon />
              </HeaderIcon>
            </Link>
          )
        ) : null}
      </div>

      {!hideAuthLink && loggedIn ? (
        <div className="hidden md:block">
          <HeaderUserMenu username={username} indigo={indigo} light={light} />
        </div>
      ) : !hideAuthLink && !loggedIn ? (
        <Link
          href="/login"
          className={`hidden shrink-0 whitespace-nowrap text-base md:inline ${linkClass}`}
        >
          Mon compte
        </Link>
      ) : null}
    </div>
  );
}
