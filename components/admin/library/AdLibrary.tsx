"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from "react";
import dynamic from "next/dynamic";
import { toPng } from "html-to-image";
import {
  AD_DURATION_FRAMES,
  AD_FORMATS,
  AD_FPS,
  AD_PLATFORM_LABELS,
  ALL_ADS,
  AUDIENCE_LABELS,
  type AdFormat,
  type AdKind,
  type AdPlatform,
  type AdSpec,
  type StillAdSpec,
  type VideoAdSpec,
} from "@/lib/admin-ads";
import { StaticAd } from "./StaticAd";
import { AdPromptDialog } from "./AdPromptDialog";
import { MerlineAd } from "@/remotion/MerlineAd";

const AdPlayer = dynamic(() => import("./AdPlayer").then((mod) => mod.AdPlayer), {
  ssr: false,
  loading: () => <div className="ad-player-fallback">Chargement…</div>,
});

const SAVED_KEY = "merline-admin-saved-ads";

function loadSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function persistSaved(ids: string[]) {
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

function PreviewShell({
  format,
  children,
  innerRef,
}: {
  format: AdFormat;
  children: ReactNode;
  innerRef?: Ref<HTMLDivElement>;
}) {
  const size = AD_FORMATS[format];
  const maxW = format === "reels" ? 168 : format === "wide" ? 280 : 220;
  const scale = maxW / size.width;

  return (
    <div
      className="ad-preview-shell"
      style={{ width: size.width * scale, height: size.height * scale }}
    >
      <div
        ref={innerRef}
        className="ad-preview-inner"
        style={{
          width: size.width,
          height: size.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function LazyVideo({ spec }: { spec: VideoAdSpec }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} style={{ width: "100%", height: "100%" }}>
      {visible ? <AdPlayer spec={spec} /> : <div className="ad-player-fallback">Vidéo 15 s</div>}
    </div>
  );
}

function AdMeta({ spec }: { spec: AdSpec }) {
  return (
    <div className="ad-card-meta">
      <p className="ad-card-title">
        {spec.kind === "image" ? spec.headline.replace(/\n/g, " ") : spec.hook}
      </p>
      <p className="ad-card-tags">
        <span>{spec.kind === "video" ? "Vidéo" : "Image"}</span>
        <span>{AD_FORMATS[spec.format].label}</span>
        <span>{AUDIENCE_LABELS[spec.audience]}</span>
      </p>
      <p className="ad-card-platforms">
        {spec.platforms.map((platform) => AD_PLATFORM_LABELS[platform]).join(" · ")}
      </p>
    </div>
  );
}

export function AdLibrary() {
  const [kind, setKind] = useState<"all" | AdKind | "saved">("all");
  const [format, setFormat] = useState<"all" | AdFormat>("all");
  const [platform, setPlatform] = useState<"all" | AdPlatform>("all");
  const [saved, setSaved] = useState<string[]>(loadSaved);
  const [promptOpen, setPromptOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stillRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const ads = useMemo(() => {
    return ALL_ADS.filter((ad) => {
      if (kind === "saved") return saved.includes(ad.id);
      if (kind !== "all" && ad.kind !== kind) return false;
      if (format !== "all" && ad.format !== format) return false;
      if (platform !== "all" && !ad.platforms.includes(platform)) return false;
      return true;
    });
  }, [kind, format, platform, saved]);

  const markSaved = useCallback((id: string) => {
    setSaved((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      persistSaved(next);
      return next;
    });
  }, []);

  const saveStill = useCallback(async (spec: StillAdSpec) => {
    const node = stillRefs.current[spec.id];
    if (!node) throw new Error("Visuel introuvable.");
    const size = AD_FORMATS[spec.format];
    const dataUrl = await toPng(node, {
      width: size.width,
      height: size.height,
      pixelRatio: 1,
      cacheBust: true,
      style: {
        transform: "none",
        width: `${size.width}px`,
        height: `${size.height}px`,
      },
    });
    downloadDataUrl(dataUrl, `merline-${spec.id}.png`);
    markSaved(spec.id);
  }, [markSaved]);

  const saveVideo = useCallback(async (spec: VideoAdSpec) => {
    const size = AD_FORMATS[spec.format];
    const { renderMediaOnWeb } = await import("@remotion/web-renderer");
    const result = await renderMediaOnWeb({
      composition: {
        id: spec.id,
        component: MerlineAd,
        durationInFrames: AD_DURATION_FRAMES,
        fps: AD_FPS,
        width: size.width,
        height: size.height,
        defaultProps: {
          theme: spec.theme,
          format: spec.format,
          hook: spec.hook,
          problem: spec.problem,
          solution: spec.solution,
          cta: spec.cta,
          illustration: spec.illustration,
        },
      },
      inputProps: {
        theme: spec.theme,
        format: spec.format,
        hook: spec.hook,
        problem: spec.problem,
        solution: spec.solution,
        cta: spec.cta,
        illustration: spec.illustration,
      },
      muted: true,
      allowHtmlInCanvas: true,
      videoBitrate: "high",
      onProgress: ({ progress: value }) => setProgress(Math.round(value * 100)),
    });
    const blob = await result.getBlob();
    downloadBlob(blob, `merline-${spec.id}.mp4`);
    markSaved(spec.id);
  }, [markSaved]);

  async function saveAd(spec: AdSpec) {
    setError(null);
    setBusyId(spec.id);
    setProgress(spec.kind === "video" ? 0 : null);
    try {
      if (spec.kind === "image") await saveStill(spec);
      else await saveVideo(spec);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d’enregistrer.");
    } finally {
      setBusyId(null);
      setProgress(null);
    }
  }

  return (
    <section className="admin-section admin-library">
      <div className="admin-card-head">
        <p className="admin-library-lead">
          Visuels et films aux formats Carré, Reels et 16:9 — Facebook, Instagram, X.
        </p>
        <button
          type="button"
          className="admin-btn-ghost"
          onClick={() => setPromptOpen(true)}
        >
          Prompt
        </button>
      </div>

      <div className="admin-library-filters">
        <FilterGroup
          label="Type"
          value={kind}
          onChange={setKind}
          options={[
            ["all", "Tous"],
            ["image", "Images"],
            ["video", "Vidéos"],
            ["saved", "Sauvegardés"],
          ]}
        />
        <FilterGroup
          label="Format"
          value={format}
          onChange={setFormat}
          options={[
            ["all", "Tous"],
            ["square", "Carré"],
            ["reels", "Reels"],
            ["wide", "16:9"],
          ]}
        />
        <FilterGroup
          label="Plateforme"
          value={platform}
          onChange={setPlatform}
          options={[
            ["all", "Toutes"],
            ["facebook", "Facebook"],
            ["instagram", "Instagram"],
            ["x", "X"],
          ]}
        />
      </div>

      {error ? <p className="admin-login-error">{error}</p> : null}

      {ads.length === 0 ? (
        <p className="admin-empty">Aucun visuel dans ce filtre.</p>
      ) : (
        <div className="ad-library-grid">
          {ads.map((spec) => (
            <article key={spec.id} className="ad-card">
              <div className="ad-card-preview">
                {spec.kind === "image" ? (
                  <PreviewShell
                    format={spec.format}
                    innerRef={(node) => {
                      stillRefs.current[spec.id] = node;
                    }}
                  >
                    <StaticAd spec={spec} />
                  </PreviewShell>
                ) : (
                  <PreviewShell format={spec.format}>
                    <LazyVideo spec={spec} />
                  </PreviewShell>
                )}
              </div>
              <AdMeta spec={spec} />
              <div className="ad-card-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-inline"
                  disabled={busyId === spec.id}
                  onClick={() => saveAd(spec)}
                >
                  {busyId === spec.id
                    ? spec.kind === "video" && progress !== null
                      ? `Export ${progress} %`
                      : "Enregistrement…"
                    : saved.includes(spec.id)
                      ? spec.kind === "video"
                        ? "Télécharger MP4"
                        : "Télécharger PNG"
                      : spec.kind === "video"
                        ? "Sauvegarder MP4"
                        : "Sauvegarder PNG"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <AdPromptDialog open={promptOpen} onClose={() => setPromptOpen(false)} />
    </section>
  );
}

function FilterGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<readonly [T, string]>;
}) {
  return (
    <div className="admin-filter">
      <span>{label}</span>
      <div>
        {options.map(([id, name]) => (
          <button
            key={id}
            type="button"
            className={value === id ? "is-active" : ""}
            onClick={() => onChange(id)}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
