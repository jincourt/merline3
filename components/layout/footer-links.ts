export type FooterLink = {
  href: string;
  label: string;
};

export const footerPlatformLinks: FooterLink[] = [
  { href: "/tarifs", label: "Merline Pro" },
  { href: "/tarifs#publicite", label: "Publicité" },
];

export const footerLegalLinks: FooterLink[] = [
  { href: "/termes-conditions", label: "Termes & Conditions" },
  { href: "/politique-confidentialite", label: "Politique de confidentialité" },
];

export const footerLanguageLabels = [
  "Anglais",
  "Français",
  "Allemand",
  "Espagnol",
] as const;
