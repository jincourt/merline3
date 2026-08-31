"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const WORDS = ["vite", "au meilleur prix", "sans effort"] as const;
const LONGEST_WORD = "au meilleur prix";

const slotTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function HeroRotatingWord() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % WORDS.length);
    }, 3800);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const word = WORDS[index];

  if (reduceMotion) {
    return <span className="hero-rotating-word">{word}</span>;
  }

  return (
    <span className="hero-rotating-word" aria-live="polite">
      <span className="hero-rotating-word-viewport">
        <span className="hero-rotating-word-measure" aria-hidden="true">
          {LONGEST_WORD}
        </span>
        <AnimatePresence initial={false}>
          <motion.span
            key={word}
            className="hero-rotating-word-inner"
            initial={{ opacity: 0, y: "60%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-60%" }}
            transition={slotTransition}
          >
            {word}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
