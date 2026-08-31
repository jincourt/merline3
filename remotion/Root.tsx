import { Composition } from "remotion";
import { AD_DURATION_FRAMES, AD_FORMATS, AD_FPS, VIDEO_ADS } from "@/lib/admin-ads";
import { MerlineAd } from "./MerlineAd";

export function RemotionRoot() {
  return (
    <>
      {VIDEO_ADS.map((ad) => {
        const size = AD_FORMATS[ad.format];
        return (
          <Composition
            key={ad.id}
            id={ad.id}
            component={MerlineAd}
            durationInFrames={AD_DURATION_FRAMES}
            fps={AD_FPS}
            width={size.width}
            height={size.height}
            defaultProps={{
              theme: ad.theme,
              format: ad.format,
              hook: ad.hook,
              problem: ad.problem,
              solution: ad.solution,
              cta: ad.cta,
              illustration: ad.illustration,
            }}
          />
        );
      })}
    </>
  );
}
