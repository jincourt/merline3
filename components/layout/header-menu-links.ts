import type { ComponentType } from "react";
import {
  FavoritesIcon,
  ListingsIcon,
  MessagesIcon,
  PlusIcon,
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

export type HeaderMenuGroups = {
  primary: AccountMenuLink[];
  account: AccountMenuLink[];
};

const primaryMenuLinks: AccountMenuLink[] = [
  { href: "/vendre", label: "Publier une annonce", icon: PlusIcon },
  { href: "/dashboard/messages", label: "Messages", icon: MessagesIcon },
];

const dashboardMenuLinks: AccountMenuLink[] = [
  { href: "/dashboard/annonces", label: "Mes annonces", icon: ListingsIcon },
  { href: "/dashboard/favoris", label: "Mes favoris", icon: FavoritesIcon },
  { href: "/dashboard/parametres", label: "Paramètres", icon: SettingsIcon },
];

export function getHeaderMenuGroups(username?: string): HeaderMenuGroups {
  const profileLink = username?.trim()
    ? [
        {
          href: getProfileHref(username.trim()),
          label: "Mon profil",
          icon: UserIcon,
        },
      ]
    : [];

  return {
    primary: primaryMenuLinks,
    account: [...profileLink, ...dashboardMenuLinks],
  };
}

export function getAccountMenuLinks(username?: string): AccountMenuLink[] {
  const { primary, account } = getHeaderMenuGroups(username);
  return [...primary, ...account];
}

/** @deprecated Use getHeaderMenuGroups(username) */
export const accountMenuLinks = [...primaryMenuLinks, ...dashboardMenuLinks];
