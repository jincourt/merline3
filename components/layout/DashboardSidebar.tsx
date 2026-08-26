"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";

const links = [
  {
    href: "/dashboard/annonces",
    label: "Vos annonces",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path strokeLinecap="round" d="M9 12h6M9 16h6" />
      </svg>
    ),
  },
  {
    href: "/dashboard/messages",
    label: "Messages",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        />
      </svg>
    ),
  },
];

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-header">
        <Link href="/" className="dashboard-sidebar-brand">
          <Image
            src="/merline.gif"
            alt=""
            width={32}
            height={32}
            className="dashboard-sidebar-logo object-contain"
            unoptimized
          />
          <span>Merline</span>
        </Link>
      </div>

      <nav className="dashboard-sidebar-nav" aria-label="Navigation du tableau de bord">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`dashboard-nav-link ${active ? "dashboard-nav-link-active" : ""}`}
            >
              <span className="dashboard-nav-icon">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="dashboard-sidebar-footer">
        <Link
          href="/dashboard/parametres"
          className={`dashboard-nav-link ${
            pathname.startsWith("/dashboard/parametres")
              ? "dashboard-nav-link-active"
              : ""
          }`}
        >
          <span className="dashboard-nav-icon">
            <SettingsIcon />
          </span>
          Paramètres
        </Link>

        <form action={signOut}>
          <button type="submit" className="dashboard-nav-link w-full">
            <span className="dashboard-nav-icon">
              <LogOutIcon />
            </span>
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
