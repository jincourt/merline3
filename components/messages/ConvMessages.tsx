"use client";

import { useEffect, useRef } from "react";

export function ConvMessages({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }, [children]);

  return (
    <div ref={ref} className="messages-conv-feed">
      {children}
    </div>
  );
}
