"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type TypewriterStat = {
  before: string;
  after: string;
  label: string;
  detail: string;
};

const speeds = {
  numbers: 42,
  label: 38,
} as const;

const holdMs = 2200;

type Phase = "numbers" | "label" | "detail";

function Typewriter({
  text,
  active,
  speed,
  cursorClass,
  onDone,
}: {
  text: string;
  active: boolean;
  speed: number;
  cursorClass: string;
  onDone?: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const onDoneRef = useRef(onDone);

  onDoneRef.current = onDone;

  useEffect(() => {
    if (!active) {
      setDisplayed("");
      return;
    }

    setDisplayed("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
        onDoneRef.current?.();
      }
    }, speed);

    return () => window.clearInterval(timer);
  }, [text, active, speed]);

  const writing = active && displayed.length < text.length;

  return (
    <span>
      {displayed}
      {writing ? (
        <span
          className={`ml-0.5 inline-block w-[2px] animate-pulse ${cursorClass} align-middle`}
          style={{ height: "0.85em" }}
          aria-hidden
        />
      ) : null}
    </span>
  );
}

type TypewriterStatsColumnProps = {
  stats: readonly TypewriterStat[];
  variant?: "light" | "indigo";
};

export function TypewriterStatsColumn({
  stats,
  variant = "indigo",
}: TypewriterStatsColumnProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("numbers");
  const holdTimerRef = useRef<number | null>(null);

  const activeStat = stats[activeIndex];
  const numbersText = `${activeStat.before} → ${activeStat.after}`;
  const isIndigo = variant === "indigo";

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const advanceStat = useCallback(() => {
    clearHoldTimer();
    setPhase("numbers");
    setActiveIndex((current) => (current + 1) % stats.length);
  }, [clearHoldTimer, stats.length]);

  const handleNumbersDone = useCallback(() => {
    setPhase("label");
  }, []);

  const handleLabelDone = useCallback(() => {
    setPhase("detail");
    clearHoldTimer();
    holdTimerRef.current = window.setTimeout(advanceStat, holdMs);
  }, [advanceStat, clearHoldTimer]);

  useEffect(() => {
    setPhase("numbers");
    return clearHoldTimer;
  }, [activeIndex, clearHoldTimer]);

  const cursorClass = isIndigo ? "bg-white" : "bg-[var(--indigo)]";
  const numbersClass = isIndigo ? "text-white" : "text-[var(--foreground)]";
  const labelMutedClass = isIndigo ? "text-white/20" : "text-[var(--muted)]/40";
  const labelActiveClass = isIndigo ? "text-white/85" : "text-[var(--foreground)]";
  const detailMutedClass = isIndigo ? "text-white/20" : "text-[var(--muted)]/40";
  const detailActiveClass = isIndigo ? "text-white/85" : "text-[var(--muted)]";

  return (
    <div className="flex min-h-full flex-col md:pl-8 lg:pl-12">
      <div className="relative min-h-[3.5rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              className={`section-title text-xl font-medium tracking-tight md:text-2xl ${numbersClass}`}
            >
              {phase === "numbers" ? (
                <Typewriter
                  text={numbersText}
                  active
                  speed={speeds.numbers}
                  cursorClass={cursorClass}
                  onDone={handleNumbersDone}
                />
              ) : (
                numbersText
              )}
            </p>

            <p className="mt-2 text-sm font-medium md:text-base">
              {phase === "numbers" ? (
                <span className={labelMutedClass}>{activeStat.label}</span>
              ) : phase === "label" ? (
                <span className={labelActiveClass}>
                  <Typewriter
                    text={activeStat.label}
                    active
                    speed={speeds.label}
                    cursorClass={cursorClass}
                    onDone={handleLabelDone}
                  />
                </span>
              ) : (
                <span className={labelActiveClass}>{activeStat.label}</span>
              )}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-auto pt-6 md:pt-8">
        <p
          className={`ml-auto max-w-xs text-right text-sm leading-relaxed transition-colors duration-300 md:max-w-sm md:text-base ${
            phase === "detail" ? detailActiveClass : detailMutedClass
          }`}
        >
          {activeStat.detail}
        </p>
      </div>
    </div>
  );
}
