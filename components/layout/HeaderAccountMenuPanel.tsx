"use client";

import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { HeaderIcon } from "./HeaderIcons";
import { getHeaderMenuGroups, type AccountMenuLink } from "./header-menu-links";

function isMenuItemActive(pathname: string, href: string) {
  if (href.startsWith("/profil/")) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuItem({
  item,
  active,
  onNavigate,
  emphasis = false,
}: {
  item: AccountMenuLink;
  active: boolean;
  onNavigate: () => void;
  emphasis?: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      role="menuitem"
      className={`header-user-menu-item ${
        active ? "header-user-menu-item-active" : ""
      } ${emphasis ? "header-user-menu-item-emphasis" : ""}`}
      onClick={onNavigate}
    >
      <HeaderIcon className="header-user-menu-item-icon">
        <Icon />
      </HeaderIcon>
      <span>{item.label}</span>
    </Link>
  );
}

export function HeaderAccountMenuPanel({
  username,
  pathname,
  onNavigate,
  showUserHeader = false,
}: {
  username?: string;
  pathname: string;
  onNavigate: () => void;
  showUserHeader?: boolean;
}) {
  const { primary, account } = getHeaderMenuGroups(username);
  const displayName = username || "Mon compte";

  return (
    <>
      {showUserHeader ? (
        <div className="header-user-menu-header">
          <p className="header-user-menu-name">{displayName}</p>
        </div>
      ) : null}

      <div className="header-user-menu-section">
        {primary.map((item) => (
          <MenuItem
            key={item.href}
            item={item}
            active={isMenuItemActive(pathname, item.href)}
            onNavigate={onNavigate}
            emphasis={item.href === "/vendre"}
          />
        ))}
      </div>

      <div className="header-user-menu-divider" aria-hidden />

      <div className="header-user-menu-section">
        {account.map((item) => (
          <MenuItem
            key={item.href}
            item={item}
            active={isMenuItemActive(pathname, item.href)}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <div className="header-user-menu-footer">
        <form action={signOut}>
          <button type="submit" role="menuitem" className="header-user-menu-signout">
            Déconnexion
          </button>
        </form>
      </div>
    </>
  );
}
