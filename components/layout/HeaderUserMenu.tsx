"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { signOut } from "@/app/auth/actions";
import { HeaderIcon } from "./HeaderIcons";
import { accountMenuLinks } from "./header-menu-links";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 8 5 5 5-5" />
    </svg>
  );
}

type MenuPosition = {
  top: number;
  right: number;
};

export function HeaderUserMenu({
  username,
  indigo = false,
  light = false,
}: {
  username?: string;
  indigo?: boolean;
  light?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ top: 0, right: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const displayName = username || "Mon compte";

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    function updatePosition() {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 18,
        right: Math.max(16, window.innerWidth - rect.right),
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const triggerClass = indigo
    ? "text-white hover:text-white/90"
    : light
      ? "text-[#0a0a0a] hover:text-[#52525b]"
      : "text-[var(--foreground)] hover:text-[var(--muted)]";

  const menu =
    open && mounted ? (
      <div
        ref={menuRef}
        className="header-user-menu"
        role="menu"
        style={{ top: menuPosition.top, right: menuPosition.right }}
      >
        <div className="header-user-menu-links">
          {accountMenuLinks.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className={`header-user-menu-item ${active ? "header-user-menu-item-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <HeaderIcon>
                  <Icon />
                </HeaderIcon>
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="header-user-menu-footer">
          <form action={signOut}>
            <button type="submit" role="menuitem" className="header-user-menu-signout">
              Déconnexion
            </button>
          </form>
        </div>
      </div>
    ) : null;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex max-w-[14rem] items-center gap-1.5 text-base font-medium transition-colors ${triggerClass}`}
        aria-expanded={open}
        aria-haspopup="menu"
        title={username || undefined}
      >
        <span className="truncate">{displayName}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
