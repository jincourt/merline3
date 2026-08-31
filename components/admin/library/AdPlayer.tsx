"use client";

import { Player } from "@remotion/player";
import { AD_DURATION_FRAMES, AD_FORMATS, AD_FPS } from "@/lib/admin-ads";
import type { VideoAdSpec } from "@/lib/admin-ads";
import { MerlineAd } from "@/remotion/MerlineAd";

export function AdPlayer({ spec }: { spec: VideoAdSpec }) {
  const size = AD_FORMATS[spec.format];

  return (
    <Player
      component={MerlineAd}
      inputProps={{
        theme: spec.theme,
        format: spec.format,
        hook: spec.hook,
        problem: spec.problem,
        solution: spec.solution,
        cta: spec.cta,
        illustration: spec.illustration,
      }}
      durationInFrames={AD_DURATION_FRAMES}
      fps={AD_FPS}
      compositionWidth={size.width}
      compositionHeight={size.height}
      style={{ width: "100%", height: "100%" }}
      autoPlay
      loop
    />
  );
}
