"use client";

import type { ReactNode } from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { AdFormat, AdIllustration, AdTheme } from "@/lib/admin-ads";
import { AD_THEMES } from "@/lib/admin-ads";
import {
  AdIllustrationBlock,
  CtaPill,
  GeometricGrid,
  Wordmark,
  AD_FONT,
} from "./ad-kit";

export type MerlineAdProps = {
  theme: AdTheme;
  format: AdFormat;
  hook: string;
  problem: string;
  solution: string;
  cta: string;
  illustration: AdIllustration;
};

function FadeUp({
  children,
  delay = 0,
  from = 28,
}: {
  children: ReactNode;
  delay?: number;
  from?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 90, mass: 0.8 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const y = interpolate(enter, [0, 1], [from, 0]);

  return (
    <div style={{ opacity, transform: `translateY(${y}px)` }}>{children}</div>
  );
}

function SceneShell({
  theme,
  children,
  pad,
}: {
  theme: AdTheme;
  children: ReactNode;
  pad: number;
}) {
  const t = AD_THEMES[theme];
  const mark = theme === "indigo" ? "#ffffff" : "#4f46e5";

  return (
    <AbsoluteFill
      style={{
        background: t.bg,
        fontFamily: AD_FONT,
        color: t.fg,
      }}
    >
      <GeometricGrid color={t.grid} />
      <div
        style={{
          position: "absolute",
          inset: pad,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Wordmark color={t.fg} mark={mark} size={32} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function Headline({
  text,
  color,
  size,
}: {
  text: string;
  color: string;
  size: number;
}) {
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: 500,
        lineHeight: 1.05,
        letterSpacing: "-0.04em",
        color,
        whiteSpace: "pre-wrap",
        maxWidth: "92%",
      }}
    >
      {text}
    </div>
  );
}

export function MerlineAd({
  theme,
  format,
  hook,
  problem,
  solution,
  cta,
  illustration,
}: MerlineAdProps) {
  const t = AD_THEMES[theme];
  const reels = format === "reels";
  const wide = format === "wide";
  const pad = reels ? 72 : wide ? 80 : 64;
  const titleSize = reels ? 72 : wide ? 68 : 64;
  const subSize = reels ? 28 : 24;

  return (
    <AbsoluteFill style={{ background: t.bg }}>
      <Sequence from={0} durationInFrames={90} premountFor={15}>
        <SceneShell theme={theme} pad={pad}>
          <FadeUp>
            <Headline text={hook} color={t.fg} size={titleSize} />
          </FadeUp>
        </SceneShell>
      </Sequence>

      <Sequence from={90} durationInFrames={90} premountFor={15}>
        <SceneShell theme={theme} pad={pad}>
          <FadeUp>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: t.mutedSoft,
                marginBottom: 18,
              }}
            >
              Le problème
            </div>
            <Headline text={problem} color={t.fg} size={reels ? 52 : 48} />
          </FadeUp>
        </SceneShell>
      </Sequence>

      <Sequence from={180} durationInFrames={165} premountFor={15}>
        <SceneShell theme={theme} pad={pad}>
            <div
              style={{
                display: "flex",
                flexDirection: wide ? "row" : "column",
                alignItems: wide ? "center" : "flex-start",
                justifyContent: "center",
              }}
            >
              <div style={{ flex: 1, minWidth: 0, marginRight: wide ? 64 : 0, marginBottom: wide ? 0 : 36 }}>
              <FadeUp>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: t.mutedSoft,
                    marginBottom: 18,
                  }}
                >
                  La solution
                </div>
                <Headline text={solution} color={t.fg} size={reels ? 48 : 44} />
              </FadeUp>
            </div>
            <FadeUp delay={6} from={40}>
              <AdIllustrationBlock type={illustration} theme={theme} format={format} />
            </FadeUp>
          </div>
        </SceneShell>
      </Sequence>

      <Sequence from={345} durationInFrames={105} premountFor={15}>
        <SceneShell theme={theme} pad={pad}>
          <FadeUp>
            <Headline text={cta} color={t.fg} size={titleSize} />
            <div style={{ marginTop: 28, fontSize: subSize, color: t.muted }}>
              merline.ch
            </div>
            <div style={{ marginTop: 36 }}>
              <CtaPill label="Ouvrir Merline" bg={t.ctaBg} fg={t.ctaFg} large />
            </div>
          </FadeUp>
        </SceneShell>
      </Sequence>
    </AbsoluteFill>
  );
}
