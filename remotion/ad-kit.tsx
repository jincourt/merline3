"use client";

import type { AdFormat, AdIllustration, AdTheme } from "@/lib/admin-ads";
import { AD_THEMES } from "@/lib/admin-ads";

export const AD_FONT =
  'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif';

export function themeOf(theme: AdTheme) {
  return AD_THEMES[theme];
}

export function GeometricGrid({ color }: { color: string }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1080 1080"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0 }}
    >
      <g stroke={color} strokeWidth="1.5" fill="none">
        <line x1="0" y1="86" x2="1080" y2="86" />
        <line x1="0" y1="238" x2="840" y2="238" />
        <line x1="0" y1="410" x2="1080" y2="410" />
        <line x1="0" y1="562" x2="700" y2="562" />
        <line x1="0" y1="734" x2="1080" y2="734" />
        <line x1="151" y1="0" x2="151" y2="1080" />
        <line x1="389" y1="0" x2="389" y2="1080" />
        <line x1="842" y1="0" x2="842" y2="1080" />
        <line x1="0" y1="320" x2="454" y2="1080" />
        <line x1="1080" y1="150" x2="300" y2="1080" />
        <rect x="64" y="54" width="100" height="100" />
        <rect x="734" y="86" width="160" height="80" />
        <circle cx="930" cy="390" r="72" />
        <circle cx="108" cy="346" r="48" />
        <circle cx="475" cy="842" r="36" />
      </g>
    </svg>
  );
}

export function Wordmark({
  color,
  mark,
  size = 28,
}: {
  color: string;
  mark: string;
  size?: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden style={{ marginRight: 12 }}>
        <rect width="32" height="32" rx="6" fill={mark} />
        <path
          d="M7 23V9.5L12.4 18.2L16 11.4L19.6 18.2L24 9.5V23"
          fill="none"
          stroke={mark === "#ffffff" ? "#4f46e5" : "#ffffff"}
          strokeWidth="2.1"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{
          fontFamily: AD_FONT,
          fontSize: size * 0.72,
          fontWeight: 600,
          letterSpacing: "-0.03em",
          color,
        }}
      >
        Merline
      </span>
    </div>
  );
}

function BikeArt({ color }: { color: string }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 320" aria-hidden>
      <rect width="320" height="320" fill="#ececee" />
      <g fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="92" cy="214" r="46" />
        <circle cx="228" cy="214" r="46" />
        <circle cx="92" cy="214" r="8" fill={color} stroke="none" />
        <circle cx="228" cy="214" r="8" fill={color} stroke="none" />
        <path d="M92 214 L148 214 L176 128 H236" />
        <path d="M148 214 L176 128 L124 128" />
        <path d="M176 128 L168 104 H196" />
        <rect x="214" y="118" width="28" height="18" rx="2" fill={color} stroke="none" />
        <path d="M228 214 L176 128" />
      </g>
    </svg>
  );
}

export function ListingCardArt({
  width = 420,
  compact = false,
}: {
  width?: number;
  compact?: boolean;
}) {
  const scale = width / 420;
  const pad = 22 * scale;
  const img = compact ? 160 * scale : 220 * scale;

  return (
    <div
      style={{
        width,
        background: "#ffffff",
        borderRadius: 6,
        overflow: "hidden",
        boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
        border: "1px solid rgba(0,0,0,0.06)",
        fontFamily: AD_FONT,
      }}
    >
      <div style={{ height: img, background: "#ececee", position: "relative" }}>
        <BikeArt color="#4f46e5" />
        <span
          style={{
            position: "absolute",
            top: 14 * scale,
            left: 14 * scale,
            background: "#4f46e5",
            color: "#fff",
            fontSize: 11 * scale,
            fontWeight: 500,
            letterSpacing: "0.04em",
            padding: `${5 * scale}px ${9 * scale}px`,
            borderRadius: 4,
          }}
        >
          80 CHF
        </span>
      </div>
      <div style={{ padding: pad }}>
        <div style={{ fontSize: 20 * scale, fontWeight: 500, letterSpacing: "-0.03em", color: "#0a0a0a" }}>
          Vélo électrique
        </div>
        <div style={{ marginTop: 6 * scale, fontSize: 13 * scale, color: "#71717a" }}>
          Mobilité · Genève
        </div>
        <div
          style={{
            marginTop: 14 * scale,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span style={{ fontSize: 12 * scale, color: "#71717a" }}>Commission</span>
          <span style={{ fontSize: 14 * scale, fontWeight: 500, color: "#0a0a0a" }}>80 CHF</span>
        </div>
        <div
          style={{
            marginTop: 6 * scale,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span style={{ fontSize: 12 * scale, color: "#71717a" }}>Prix</span>
          <span style={{ fontSize: 14 * scale, fontWeight: 500, color: "#0a0a0a" }}>850 CHF</span>
        </div>
        <div
          style={{
            marginTop: 18 * scale,
            display: "flex",
            alignItems: "center",
            borderTop: "1px solid rgba(0,0,0,0.08)",
            paddingTop: 14 * scale,
          }}
        >
          <div
            style={{
              width: 28 * scale,
              height: 28 * scale,
              borderRadius: 99,
              background: "#4f46e5",
              color: "#fff",
              fontSize: 11 * scale,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10 * scale,
            }}
          >
            AM
          </div>
          <div>
            <div style={{ fontSize: 13 * scale, fontWeight: 500, color: "#0a0a0a" }}>Anne M.</div>
            <div style={{ fontSize: 11 * scale, color: "#71717a" }}>★★★★★ 12 avis</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConversationArt({ width = 420 }: { width?: number }) {
  const scale = width / 420;
  const bubble = (text: string, from: "agent" | "seller") => (
    <div
      style={{
        alignSelf: from === "agent" ? "flex-start" : "flex-end",
        maxWidth: "78%",
        background: from === "agent" ? "#4f46e5" : "#f4f4f5",
        color: from === "agent" ? "#fff" : "#0a0a0a",
        borderRadius: 10,
        padding: `${12 * scale}px ${14 * scale}px`,
        fontSize: 15 * scale,
        lineHeight: 1.35,
        fontWeight: 500,
        letterSpacing: "-0.02em",
      }}
    >
      {text}
    </div>
  );

  return (
    <div
      style={{
        width,
        background: "#ffffff",
        borderRadius: 6,
        padding: 22 * scale,
        boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
        border: "1px solid rgba(0,0,0,0.06)",
        fontFamily: AD_FONT,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ fontSize: 11 * scale, color: "#71717a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 * scale }}>
        Conversation
      </div>
      <div style={{ marginBottom: 12 * scale }}>{bubble("J’ai un acheteur pour votre vélo.", "agent")}</div>
      <div style={{ marginBottom: 12 * scale }}>{bubble("On peut se voir demain.", "seller")}</div>
      {bubble("Je lui transmets vos coordonnées.", "agent")}
    </div>
  );
}

export function NetworkArt({
  width = 480,
  fg,
  muted,
}: {
  width?: number;
  fg: string;
  muted: string;
}) {
  const scale = width / 480;
  const node = (label: string, mark: string, x: number) => (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 70 * scale,
        width: 150 * scale,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 72 * scale,
          height: 72 * scale,
          margin: "0 auto",
          borderRadius: 99,
          border: `1.5px solid ${fg}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13 * scale,
          fontWeight: 500,
          color: fg,
          background: "transparent",
        }}
      >
        {mark}
      </div>
      <div
        style={{
          marginTop: 12 * scale,
          fontSize: 14 * scale,
          fontWeight: 500,
          color: fg,
          letterSpacing: "-0.02em",
        }}
      >
        {label}
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: "relative",
        width,
        height: 220 * scale,
        fontFamily: AD_FONT,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 110 * scale,
          right: 110 * scale,
          top: 104 * scale,
          height: 1.5,
          background: fg,
          opacity: 0.35,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 86 * scale,
          transform: "translateX(-50%)",
          background: "#4f46e5",
          color: "#fff",
          fontSize: 11 * scale,
          fontWeight: 500,
          padding: `${6 * scale}px ${10 * scale}px`,
          borderRadius: 4,
          letterSpacing: "0.02em",
        }}
      >
        Commission
      </div>
      {node("Annonceur", "An", 24 * scale)}
      {node("Agent", "Ag", 306 * scale)}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          textAlign: "center",
          fontSize: 13 * scale,
          color: muted,
        }}
      >
        Une vente. Deux gagnants.
      </div>
    </div>
  );
}

export function AdIllustrationBlock({
  type,
  theme,
  format,
}: {
  type: AdIllustration;
  theme: AdTheme;
  format: AdFormat;
}) {
  const t = themeOf(theme);
  const wide = format === "wide";
  const reels = format === "reels";
  const cardW = wide ? 440 : reels ? 400 : 380;

  if (type === "listing") return <ListingCardArt width={cardW} compact={reels} />;
  if (type === "conversation") return <ConversationArt width={Math.min(cardW, 420)} />;
  if (type === "network") {
    return <NetworkArt width={Math.min(cardW + 40, 480)} fg={t.fg} muted={t.muted} />;
  }
  return null;
}

export function CtaPill({
  label,
  bg,
  fg,
  large = false,
}: {
  label: string;
  bg: string;
  fg: string;
  large?: boolean;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: large ? 56 : 48,
        padding: large ? "0 28px" : "0 22px",
        borderRadius: 6,
        background: bg,
        color: fg,
        fontFamily: AD_FONT,
        fontSize: large ? 18 : 16,
        fontWeight: 500,
        letterSpacing: "0.01em",
      }}
    >
      {label}
    </div>
  );
}
