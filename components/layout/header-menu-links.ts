import { FavoritesIcon, ListingsIcon, SettingsIcon } from "./HeaderIcons";

export const accountMenuLinks = [
  { href: "/dashboard/annonces", label: "Mes annonces", icon: ListingsIcon },
  { href: "/dashboard/favoris", label: "Mes favoris", icon: FavoritesIcon },
  { href: "/dashboard/parametres", label: "Paramètres", icon: SettingsIcon },
] as const;
