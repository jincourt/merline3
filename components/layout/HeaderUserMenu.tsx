"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { HeaderAccountMenuPanel } from "./HeaderAccountMenuPanel";

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
        top: rect.bottom + 8,
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
    ? "header-user-menu-trigger header-user-menu-trigger-indigo"
    : light
      ? "dashboard-listings-head-btn dashboard-listings-head-btn-dark header-user-menu-trigger"
      : "header-user-menu-trigger";

  const menu =
    open && mounted ? (
      <div
        ref={menuRef}
        className="header-user-menu"
        role="menu"
        style={{ top: menuPosition.top, right: menuPosition.right }}
      >
        <HeaderAccountMenuPanel
          username={username}
          pathname={pathname}
          onNavigate={() => setOpen(false)}
        />
      </div>
    ) : null;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`${triggerClass} ${open ? "header-user-menu-trigger-open" : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
        title={username || undefined}
      >
        <span className="truncate">{displayName}</span>
        <ChevronDown
          className={`header-user-menu-chevron ${open ? "header-user-menu-chevron-open" : ""}`}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>

      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
