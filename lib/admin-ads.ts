export const AD_FPS = 30;
export const AD_DURATION_FRAMES = 450;

export type AdFormat = "square" | "reels" | "wide";
export type AdTheme = "indigo" | "dark" | "light";
export type AdPlatform = "facebook" | "instagram" | "x";
export type AdKind = "image" | "video";
export type AdAudience = "annonceurs" | "agents" | "both";

export const AD_FORMATS: Record<
  AdFormat,
  { width: number; height: number; label: string; ratio: string }
> = {
  square: { width: 1080, height: 1080, label: "Carré", ratio: "1:1" },
  reels: { width: 1080, height: 1920, label: "Reels", ratio: "9:16" },
  wide: { width: 1920, height: 1080, label: "16:9", ratio: "16:9" },
};

export const AD_PLATFORM_LABELS: Record<AdPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X",
};

export const AD_THEMES: Record<
  AdTheme,
  {
    bg: string;
    fg: string;
    muted: string;
    mutedSoft: string;
    card: string;
    cardFg: string;
    cardMuted: string;
    accent: string;
    line: string;
    grid: string;
    ctaBg: string;
    ctaFg: string;
  }
> = {
  indigo: {
    bg: "#4f46e5",
    fg: "#ffffff",
    muted: "rgba(255,255,255,0.78)",
    mutedSoft: "rgba(255,255,255,0.55)",
    card: "#ffffff",
    cardFg: "#0a0a0a",
    cardMuted: "#52525b",
    accent: "#ffffff",
    line: "rgba(255,255,255,0.18)",
    grid: "rgba(255,255,255,0.14)",
    ctaBg: "#ffffff",
    ctaFg: "#4f46e5",
  },
  dark: {
    bg: "#0b0b0c",
    fg: "#f4f4f5",
    muted: "#8b8b96",
    mutedSoft: "#5c5c66",
    card: "#ffffff",
    cardFg: "#0a0a0a",
    cardMuted: "#52525b",
    accent: "#4f46e5",
    line: "rgba(255,255,255,0.08)",
    grid: "rgba(79,70,229,0.22)",
    ctaBg: "#4f46e5",
    ctaFg: "#ffffff",
  },
  light: {
    bg: "#ffffff",
    fg: "#0a0a0a",
    muted: "#52525b",
    mutedSoft: "#71717a",
    card: "#ffffff",
    cardFg: "#0a0a0a",
    cardMuted: "#52525b",
    accent: "#4f46e5",
    line: "rgba(0,0,0,0.08)",
    grid: "rgba(79,70,229,0.10)",
    ctaBg: "#4f46e5",
    ctaFg: "#ffffff",
  },
};

export type AdIllustration = "listing" | "conversation" | "network" | "none";

export type StillAdSpec = {
  id: string;
  kind: "image";
  format: AdFormat;
  theme: AdTheme;
  platforms: AdPlatform[];
  audience: AdAudience;
  layout: "poster" | "split" | "reels" | "card-hero" | "conversation";
  illustration: AdIllustration;
  kicker: string;
  headline: string;
  line?: string;
  cta: string;
};

export type VideoAdSpec = {
  id: string;
  kind: "video";
  format: AdFormat;
  theme: AdTheme;
  platforms: AdPlatform[];
  audience: AdAudience;
  hook: string;
  problem: string;
  solution: string;
  cta: string;
  illustration: AdIllustration;
};

export type AdSpec = StillAdSpec | VideoAdSpec;

export const STILL_ADS: StillAdSpec[] = [
  {
    id: "sell-square-indigo",
    kind: "image",
    format: "square",
    theme: "indigo",
    platforms: ["facebook", "instagram", "x"],
    audience: "annonceurs",
    layout: "poster",
    illustration: "listing",
    kicker: "Merline",
    headline: "Vendez.\nSans chercher.",
    line: "Les agents ont déjà l’acheteur.",
    cta: "Publier une annonce",
  },
  {
    id: "sell-square-dark",
    kind: "image",
    format: "square",
    theme: "dark",
    platforms: ["facebook", "instagram", "x"],
    audience: "annonceurs",
    layout: "poster",
    illustration: "listing",
    kicker: "Merline",
    headline: "L’acheteur\nest déjà là.",
    line: "Pas dans un flux. Dans un réseau.",
    cta: "Publier",
  },
  {
    id: "sell-square-card",
    kind: "image",
    format: "square",
    theme: "light",
    platforms: ["instagram", "facebook"],
    audience: "annonceurs",
    layout: "card-hero",
    illustration: "listing",
    kicker: "Merline",
    headline: "Une carte.\nUne commission.",
    cta: "merline.ch",
  },
  {
    id: "agent-square-indigo",
    kind: "image",
    format: "square",
    theme: "indigo",
    platforms: ["facebook", "instagram", "x"],
    audience: "agents",
    layout: "poster",
    illustration: "network",
    kicker: "Merline",
    headline: "Votre réseau.\nVotre commission.",
    line: "Apportez l’acheteur. Touchez la vente.",
    cta: "Devenir agent",
  },
  {
    id: "sell-reels-indigo",
    kind: "image",
    format: "reels",
    theme: "indigo",
    platforms: ["instagram", "facebook"],
    audience: "annonceurs",
    layout: "reels",
    illustration: "listing",
    kicker: "Merline",
    headline: "Publiez.\nC’est tout.",
    line: "Les agents s’occupent du reste.",
    cta: "Publier une annonce",
  },
  {
    id: "sell-reels-dark",
    kind: "image",
    format: "reels",
    theme: "dark",
    platforms: ["instagram", "facebook"],
    audience: "annonceurs",
    layout: "conversation",
    illustration: "conversation",
    kicker: "Merline",
    headline: "La vente\ncommence ici.",
    line: "Un agent. Un acheteur. Une commission.",
    cta: "Ouvrir Merline",
  },
  {
    id: "agent-reels-indigo",
    kind: "image",
    format: "reels",
    theme: "indigo",
    platforms: ["instagram", "facebook"],
    audience: "agents",
    layout: "reels",
    illustration: "network",
    kicker: "Pour les agents",
    headline: "Moins de prospection.\nPlus de ventes.",
    line: "Le catalogue est déjà là.",
    cta: "Voir les annonces",
  },
  {
    id: "sell-wide-indigo",
    kind: "image",
    format: "wide",
    theme: "indigo",
    platforms: ["facebook", "x"],
    audience: "annonceurs",
    layout: "split",
    illustration: "listing",
    kicker: "Merline",
    headline: "Vendez.\nSans chercher.",
    line: "Fixez la commission. Les agents trouvent l’acheteur.",
    cta: "Publier une annonce",
  },
  {
    id: "sell-wide-dark",
    kind: "image",
    format: "wide",
    theme: "dark",
    platforms: ["facebook", "x"],
    audience: "both",
    layout: "split",
    illustration: "conversation",
    kicker: "Une plateforme. Deux rôles.",
    headline: "Deux personnes.\nUne vente.",
    line: "L’annonceur publie. L’agent apporte l’acheteur.",
    cta: "Rejoindre Merline",
  },
  {
    id: "agent-wide-light",
    kind: "image",
    format: "wide",
    theme: "light",
    platforms: ["facebook", "x", "instagram"],
    audience: "agents",
    layout: "split",
    illustration: "network",
    kicker: "Merline",
    headline: "Votre réseau\nvaut une commission.",
    line: "Parcourez les annonces. Présentez l’acheteur. Touchez.",
    cta: "Devenir agent",
  },
];

export const VIDEO_ADS: VideoAdSpec[] = [
  {
    id: "video-sell-square",
    kind: "video",
    format: "square",
    theme: "indigo",
    platforms: ["facebook", "instagram", "x"],
    audience: "annonceurs",
    hook: "Votre annonce ne se vend pas.",
    problem: "Parce que l’acheteur n’est pas dans un flux. Il est dans un réseau.",
    solution: "Les agents Merline ont déjà le client.",
    cta: "Publiez. Une commission. C’est tout.",
    illustration: "listing",
  },
  {
    id: "video-sell-reels",
    kind: "video",
    format: "reels",
    theme: "indigo",
    platforms: ["instagram", "facebook"],
    audience: "annonceurs",
    hook: "Arrêtez de chercher l’acheteur.",
    problem: "Les plateformes vous laissent seuls face au silence.",
    solution: "Publiez. Les agents viennent avec le client.",
    cta: "Publier sur merline.ch",
    illustration: "listing",
  },
  {
    id: "video-sell-wide",
    kind: "video",
    format: "wide",
    theme: "dark",
    platforms: ["facebook", "x"],
    audience: "annonceurs",
    hook: "Une carte. Pas une marketplace.",
    problem: "Trop d’annonces. Pas assez de ventes.",
    solution: "Merline relie votre objet à quelqu’un qui connaît l’acheteur.",
    cta: "Publiez une fois.",
    illustration: "conversation",
  },
  {
    id: "video-agent-square",
    kind: "video",
    format: "square",
    theme: "dark",
    platforms: ["facebook", "instagram", "x"],
    audience: "agents",
    hook: "Votre réseau vaut de l’argent.",
    problem: "Vous connaissez des acheteurs. Les vendeurs ne vous connaissent pas.",
    solution: "Merline vous donne les annonces. Vous apportez la vente.",
    cta: "Touchez une commission.",
    illustration: "network",
  },
  {
    id: "video-agent-reels",
    kind: "video",
    format: "reels",
    theme: "indigo",
    platforms: ["instagram", "facebook"],
    audience: "agents",
    hook: "Moins de prospection.",
    problem: "Chercher des vendeurs prend du temps. Votre réseau attend.",
    solution: "Le catalogue est déjà là. Vous apportez l’acheteur.",
    cta: "Devenir agent",
    illustration: "network",
  },
  {
    id: "video-both-wide",
    kind: "video",
    format: "wide",
    theme: "indigo",
    platforms: ["facebook", "x"],
    audience: "both",
    hook: "Deux personnes. Une vente.",
    problem: "Les plateformes séparent ceux qui vendent et ceux qui connaissent l’acheteur.",
    solution: "Merline les relie. Autour d’une commission transparente.",
    cta: "Rejoindre Merline",
    illustration: "conversation",
  },
];

export const ALL_ADS: AdSpec[] = [...STILL_ADS, ...VIDEO_ADS];

export const AUDIENCE_LABELS: Record<AdAudience, string> = {
  annonceurs: "Annonceurs",
  agents: "Agents",
  both: "Les deux",
};

export const ADS_GENERATION_PROMPT = `Tu es designer / motion designer pour Merline. Génère de nouvelles publicités (images + vidéos Remotion) dans l’admin Library, en suivant EXACTEMENT ce process.

## Produit
Merline (Suisse) relie deux rôles autour d’une commission transparente :
- Annonceurs : publient une annonce, indiquent la commission, les agents les contactent avec un acheteur.
- Agents : parcourent le catalogue, apportent un acheteur de leur réseau, touchent la commission.
Ce n’est PAS une marketplace classique. L’acheteur n’est pas dans un flux : il est dans un réseau.

Phrase d’accueil : « Vendez rapidement grâce à nos agents. »
Agents : « Trouvez des opportunités adaptées à votre réseau et touchez une commission à chaque vente. »

## Identité visuelle (non négociable)
- Indigo : #4f46e5 (hover #4338ca)
- Dark : #0b0b0c, surface #111113, texte #f4f4f5, muted #8b8b96
- Light : #ffffff, texte #0a0a0a, muted #52525b
- Radius : 0.375rem (6px). Pas de pills géants, pas de gradients criards, pas de stock photos.
- Typo : Geist / system-ui, weight 500, tracking serré (−0.03em à −0.04em), titres courts.
- Grille géométrique (lignes, cercles, carrés, triangles) comme GeometricBackground — opacity faible, indigo.
- Cards blanches type SiteCard / CatalogCard : ombre 0 24px 60px rgba(15,23,42,0.18), bordure discrète.
- CTA : bouton indigo ou blanc selon le fond, label court (« Publier une annonce », « Devenir agent », merline.ch).

## Ton copy (Steve Jobs)
Texte minimal. Une idée par visuel. Phrases courtes, coupées. Pas de superlatifs vides, pas d’emoji, pas de « !!!! ».
Exemples :
- « Vendez. Sans chercher. »
- « L’acheteur est déjà là. »
- « Votre réseau. Votre commission. »
- « Deux personnes. Une vente. »
- « Publiez. C’est tout. »

## Formats & plateformes
- Carré 1080×1080 → Facebook, Instagram, X
- Reels 1080×1920 → Instagram, Facebook Reels (safe area haut/bas)
- 16:9 1920×1080 → Facebook, X
Toujours taguer les plateformes. Preview scaled, export taille native.

## Images (stills)
Layouts : poster (headline + card), split 16:9, reels vertical, card-hero, conversation.
Chaque visuel a une illustration propre, professionnelle, dessinée (pas de photo stock) :
- Listing card : carte produit type catalogue (ex. vélo électrique, commission, prix, avatar, étoiles).
- Conversation : bulles agent/annonceur comme HeroConversationAnimation.
- Network : deux nœuds Annonceur / Agent, commission au centre.

## Vidéos (Remotion)
Installer remotion + @remotion/player. Composition unique paramétrée (format, theme, copy).
15s @ 30fps (450 frames). Structure OBLIGATOIRE :
1. Hook (≈3s) — une phrase qui arrête le pouce
2. Problem (≈3–4s) — le silence des plateformes / le réseau inexploité
3. Solution (≈6s) — illustration animée (card / conversation / network)
4. CTA (≈3s) — phrase + merline.ch
Spring subtil (damping ~20). Pas de musique obligatoire. Mute. Preview via Player, export PNG (stills) via html-to-image, MP4 via @remotion/web-renderer (allowHtmlInCanvas).

## Admin UX
Dashboard admin : burger (pas Déconnexion dans le topbar). Le burger REMPLACE le contenu par « Merline Menu » :
- Dashboard (tabs : Vue d’ensemble, Accueil, Annonces — SANS Utilisateurs / Visiteurs)
- Utilisateurs
- Visiteurs
- Library
- Déconnexion
Library : grille, filtres format/plateforme/type, sauvegarde (localStorage + téléchargement PNG/MP4), bouton « Prompt » qui ouvre ce texte pour régénérer dans un nouveau chat.

## Fichiers clés
- components/admin/AdminDashboard.tsx, AdminMenu.tsx
- components/admin/library/*
- remotion/MerlineAd.tsx, remotion/ad-kit.tsx
- lib/admin-ads.ts (catalogue + ce prompt)
- app/admin/admin.css

Génère de NOUVEAUX visuels (nouveaux headlines, nouvelles illustrations) en restant dans ce système. Qualité Apple keynote : peu de texte, beaucoup d’espace, une image nette.`;
