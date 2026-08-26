"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { GuideNav, type GuideNavItem } from "./GuideNav";
import { MotionDiv } from "@/components/ui/motion";

export type GuideChapter = GuideNavItem & {
  content: ReactNode;
};

export function GuideViewer({ chapters }: { chapters: GuideChapter[] }) {
  const [index, setIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const chapter = chapters[index];
  const isFirst = index === 0;
  const isLast = index === chapters.length - 1;

  const goTo = useCallback((next: number) => {
    setIndex(next);
    requestAnimationFrame(() => {
      gridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  if (!chapter) return null;

  return (
    <section id="formation" className="section-indigo w-full overflow-x-clip pb-24 md:pb-32">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 pt-8">
        <div
          id="guide-content"
          ref={gridRef}
          className="grid w-full scroll-mt-24 items-start gap-4 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:gap-6"
        >
          <MotionDiv>
            <GuideNav
              items={chapters}
              activeIndex={index}
              onSelect={goTo}
            />
          </MotionDiv>

          <div key={chapter.id} className="min-w-0 w-full">
            <MotionDiv className="section-light w-full min-w-0 rounded-md bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:p-6 md:min-h-[420px] md:p-10">
              <div className="min-w-0">{chapter.content}</div>

              <div className="mt-10 flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex justify-start">
                  {!isFirst ? (
                    <button
                      type="button"
                      onClick={() => goTo(index - 1)}
                      className="btn-ghost w-full sm:w-auto"
                    >
                      Précédent
                    </button>
                  ) : (
                    <span className="hidden h-11 sm:inline-block" aria-hidden />
                  )}
                </div>

                <p className="order-first text-center text-xs text-[var(--muted-dim)] sm:order-none">
                  {index + 1} / {chapters.length}
                </p>

                <div className="flex justify-end">
                  {isLast ? (
                    <Link
                      href="/#catalogue"
                      className="btn-vendre-submit w-full sm:w-auto"
                    >
                      Ouvrir le catalogue
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => goTo(index + 1)}
                      className="btn-primary w-full sm:w-auto"
                    >
                      Suivant
                    </button>
                  )}
                </div>
              </div>
            </MotionDiv>
          </div>
        </div>
      </div>
    </section>
  );
}
