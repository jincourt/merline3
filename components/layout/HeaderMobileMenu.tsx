"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HeaderIcon, MenuIcon } from "./HeaderIcons";
import { HeaderAccountMenuPanel } from "./HeaderAccountMenuPanel";

type MenuPosition = {
  top: number;
  right: number;
};

export function HeaderMobileMenu({
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
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    top: 0,
    right: 24,
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
        right: Math.max(24, window.innerWidth - rect.right),
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
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  const triggerClass = indigo
    ? "header-user-menu-trigger header-user-menu-trigger-indigo header-user-menu-trigger-icon"
    : light
      ? "header-user-menu-trigger header-user-menu-trigger-light header-user-menu-trigger-icon"
      : "header-user-menu-trigger header-user-menu-trigger-icon";

  const menu =
    open && mounted ? (
      <>
        <button
          type="button"
          className="header-mobile-menu-backdrop"
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
        />
        <div
          ref={menuRef}
          className="header-user-menu header-mobile-menu"
          role="menu"
          style={{
            top: menuPosition.top,
            right: menuPosition.right,
          }}
        >
          <HeaderAccountMenuPanel
            username={username}
            pathname={pathname}
            onNavigate={() => setOpen(false)}
            showUserHeader
          />
        </div>
      </>
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
        aria-label="Menu du compte"
      >
        <HeaderIcon className="header-user-menu-trigger-icon-svg">
          <MenuIcon open={open} />
        </HeaderIcon>
      </button>

      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
