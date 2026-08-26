"use client";

export type GuideNavItem = {
  id: string;
  label: string;
};

export function GuideNav({
  items,
  activeIndex,
  onSelect,
}: {
  items: readonly GuideNavItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <aside className="section-light w-full min-w-0 self-start rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)] md:sticky md:top-24 md:p-5">
      <nav aria-label="Sommaire du guide">
        <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--muted-dim)]">
          Sommaire
        </p>
        <ol className="mt-3 max-h-[min(60vh,420px)] space-y-0.5 overflow-y-auto pr-1">
          {items.map((item, index) => {
            const isActive = activeIndex === index;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  aria-current={isActive ? "step" : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-[var(--indigo-soft)] text-[var(--indigo)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <span className="font-mono text-[10px] tabular-nums opacity-70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 break-words leading-snug">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}
