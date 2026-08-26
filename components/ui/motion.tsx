"use client";

import {
  motion,
  type HTMLMotionProps,
  type MotionProps,
} from "framer-motion";

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const defaultTransition = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1] as const,
};

type MotionRevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

export function MotionDiv({
  children,
  delay = 0,
  transition,
  ...props
}: MotionRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={fadeUp}
      transition={{ ...defaultTransition, delay, ...transition }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionSection({
  children,
  delay = 0,
  ...props
}: MotionProps & { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeUp}
      transition={{ ...defaultTransition, delay }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

export function MotionArticle({
  children,
  delay = 0,
  ...props
}: HTMLMotionProps<"article"> & { delay?: number }) {
  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={fadeUp}
      transition={{ ...defaultTransition, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      {...props}
    >
      {children}
    </motion.article>
  );
}
