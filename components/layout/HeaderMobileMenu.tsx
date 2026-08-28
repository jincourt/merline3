"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { signOut } from "@/app/auth/actions";
import { HeaderIcon, MenuIcon } from "./HeaderIcons";
import { getAccountMenuLinks } from "./header-menu-links";

type MenuPosition = {
  top: number;
  left: number;
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
    left: 16,
    right: 16,
  });
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
        top: rect.bottom + 12,
        left: 16,
        right: 16,
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
    ? "header-icon-btn header-icon-btn-indigo"
    : light
      ? "header-icon-btn header-icon-btn-light"
      : "header-icon-btn";

  const menuLinks = getAccountMenuLinks(username);

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
          className="header-mobile-menu"
          role="menu"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            right: menuPosition.right,
          }}
        >
          <p className="header-mobile-menu-user">{displayName}</p>
          <div className="header-user-menu-links">
            {menuLinks.map((item) => {
              const active =
                item.href.startsWith("/profil/")
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
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
      </>
    ) : null;

  return (
    <div ref={rootRef} className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`${triggerClass} ${open ? "header-icon-btn-active" : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu du compte"
      >
        <HeaderIcon className="h-5 w-5">
          <MenuIcon open={open} />
        </HeaderIcon>
      </button>

      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
