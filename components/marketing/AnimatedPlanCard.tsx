"use client";

import { MotionArticle } from "@/components/ui/motion";

export function AnimatedPlanCard({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <MotionArticle delay={delay} className={className}>
      {children}
    </MotionArticle>
  );
}
