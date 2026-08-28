export type FooterLink = {
  href: string;
  label: string;
};

export const footerPlatformLinks: FooterLink[] = [
  { href: "/", label: "Accueil" },
  { href: "/#catalogue", label: "Catalogue" },
  { href: "/vendre", label: "Publier une annonce" },
  { href: "/guide", label: "Guide agent" },
  { href: "/agents", label: "Nos agents" },
];

export const footerAccountLinks: FooterLink[] = [
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/annonces", label: "Mes annonces" },
  { href: "/dashboard/favoris", label: "Mes favoris" },
  { href: "/dashboard/parametres", label: "Paramètres" },
];

export const footerGuestLinks: FooterLink[] = [
  { href: "/login", label: "Connexion" },
  { href: "/vendre", label: "Publier une annonce" },
];

export const footerLegalLinks: FooterLink[] = [
  { href: "/termes-conditions", label: "Termes & Conditions" },
  { href: "/politique-confidentialite", label: "Politique de confidentialité" },
];
