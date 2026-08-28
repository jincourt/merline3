import type { ComponentType } from "react";
import {
  FavoritesIcon,
  ListingsIcon,
  SettingsIcon,
  UserIcon,
} from "./HeaderIcons";
import { getProfileHref } from "@/lib/profile-reviews";

export type HeaderMenuIcon = ComponentType<{ className?: string }>;

export type AccountMenuLink = {
  href: string;
  label: string;
  icon: HeaderMenuIcon;
};

const dashboardMenuLinks: AccountMenuLink[] = [
  { href: "/dashboard/annonces", label: "Mes annonces", icon: ListingsIcon },
  { href: "/dashboard/favoris", label: "Mes favoris", icon: FavoritesIcon },
  { href: "/dashboard/parametres", label: "Paramètres", icon: SettingsIcon },
];

export function getAccountMenuLinks(username?: string): AccountMenuLink[] {
  const profileLink = username?.trim()
    ? [
        {
          href: getProfileHref(username.trim()),
          label: "Mon profil",
          icon: UserIcon,
        },
      ]
    : [];

  return [...profileLink, ...dashboardMenuLinks];
}

/** @deprecated Use getAccountMenuLinks(username) */
export const accountMenuLinks = dashboardMenuLinks;
