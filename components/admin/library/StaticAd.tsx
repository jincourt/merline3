"use client";

import type { ReactNode } from "react";
import type { StillAdSpec } from "@/lib/admin-ads";
import { AD_FORMATS, AD_THEMES } from "@/lib/admin-ads";
import {
  AD_FONT,
  AdIllustrationBlock,
  CtaPill,
  GeometricGrid,
  Wordmark,
} from "@/remotion/ad-kit";

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
        fontFamily: AD_FONT,
        fontSize: size,
        fontWeight: 500,
        lineHeight: 1.04,
        letterSpacing: "-0.04em",
        color,
        whiteSpace: "pre-wrap",
      }}
    >
      {text}
    </div>
  );
}

export function StaticAd({ spec }: { spec: StillAdSpec }) {
  const size = AD_FORMATS[spec.format];
  const t = AD_THEMES[spec.theme];
  const mark = spec.theme === "indigo" ? "#ffffff" : "#4f46e5";
  const reels = spec.format === "reels";
  const wide = spec.format === "wide";
  const pad = reels ? 80 : wide ? 88 : 72;
  const titleSize = reels ? 78 : wide ? 72 : 68;
  const illustration = spec.illustration !== "none" ? (
    <AdIllustrationBlock
      type={spec.illustration}
      theme={spec.theme}
      format={spec.format}
    />
  ) : null;

  const kicker = (
    <div
      style={{
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: t.mutedSoft,
        marginBottom: 16,
      }}
    >
      {spec.kicker}
    </div>
  );

  const copy = (
    <div>
      {kicker}
      <Headline text={spec.headline} color={t.fg} size={titleSize} />
      {spec.line ? (
        <div
          style={{
            marginTop: 22,
            fontSize: reels ? 26 : 22,
            lineHeight: 1.35,
            color: t.muted,
            maxWidth: 560,
          }}
        >
          {spec.line}
        </div>
      ) : null}
    </div>
  );

  let body: ReactNode;

  if (spec.layout === "split") {
    body = (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 64,
        }}
      >
        <div style={{ flex: 1 }}>
          {copy}
          <div style={{ marginTop: 40 }}>
            <CtaPill label={spec.cta} bg={t.ctaBg} fg={t.ctaFg} large />
          </div>
        </div>
        {illustration}
      </div>
    );
  } else if (spec.layout === "reels") {
    body = (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          paddingBottom: 48,
        }}
      >
        <div style={{ marginTop: 80 }}>{copy}</div>
        <div style={{ display: "flex", justifyContent: "center" }}>{illustration}</div>
        <CtaPill label={spec.cta} bg={t.ctaBg} fg={t.ctaFg} large />
      </div>
    );
  } else if (spec.layout === "card-hero") {
    body = (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {kicker}
        <Headline text={spec.headline} color={t.fg} size={titleSize} />
        <div style={{ marginTop: 48 }}>{illustration}</div>
        <div style={{ marginTop: 40 }}>
          <CtaPill label={spec.cta} bg={t.ctaBg} fg={t.ctaFg} large />
        </div>
      </div>
    );
  } else if (spec.layout === "conversation") {
    body = (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          paddingBottom: reels ? 56 : 0,
        }}
      >
        <div style={{ marginTop: reels ? 72 : 24 }}>{copy}</div>
        <div>{illustration}</div>
        <CtaPill label={spec.cta} bg={t.ctaBg} fg={t.ctaFg} large />
      </div>
    );
  } else {
    body = (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ marginTop: reels ? 48 : 32 }}>{copy}</div>
        <div style={{ display: "flex", justifyContent: wide ? "flex-end" : "center" }}>
          {illustration}
        </div>
        <CtaPill label={spec.cta} bg={t.ctaBg} fg={t.ctaFg} large />
      </div>
    );
  }

  return (
    <div
      className="ad-still"
      style={{
        width: size.width,
        height: size.height,
        background: t.bg,
        color: t.fg,
        position: "relative",
        overflow: "hidden",
        fontFamily: AD_FONT,
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
        {body}
      </div>
    </div>
  );
}
