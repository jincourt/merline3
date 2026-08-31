"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Menu, X } from "lucide-react";
import { formatCompactNumber, formatDuration, formatViewCount } from "@/lib/analytics";
import { getListingHref } from "@/lib/types";
import type { AdminDashboardData, AdminVisitorRow } from "@/lib/admin-stats";
import { AdminMenu } from "./AdminMenu";

const AdLibrary = dynamic(
  () => import("./library/AdLibrary").then((mod) => mod.AdLibrary),
  { ssr: false, loading: () => <p className="admin-empty">Chargement de la library…</p> },
);

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  pending_payment: "Paiement",
  active: "Active",
  paused: "En pause",
  sold: "Vendue",
  found: "Trouvée",
  closed: "Fermée",
};

const PROFILE_LABELS: Record<string, string> = {
  agent: "Agent",
  annonceur: "Annonceur",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatDay(iso: string) {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function visitorLabel(visitor: AdminVisitorRow) {
  if (visitor.username) return visitor.username;
  return `Anonyme · ${visitor.id.slice(0, 8)}`;
}

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  const router = useRouter();
  const [page, setPage] = useState<"menu" | "dashboard" | "library">("dashboard");
  const previousPage = useRef<"dashboard" | "library">("dashboard");
  const [section, setSection] = useState<
    "overview" | "home" | "listings" | "users" | "visitors"
  >("overview");
  const [openVisitor, setOpenVisitor] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState("");
  const [listingQuery, setListingQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return data.users;
    return data.users.filter((user) =>
      [user.username, user.name, user.profile_type ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [data.users, userQuery]);

  const filteredListings = useMemo(() => {
    const q = listingQuery.trim().toLowerCase();
    if (!q) return data.listings;
    return data.listings.filter((listing) =>
      [listing.title, listing.category, listing.owner_username ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [data.listings, listingQuery]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const { overview } = data;

  const title =
    page === "library"
      ? "Library"
      : page === "menu"
        ? "Merline Menu"
        : section === "users"
          ? "Utilisateurs"
          : section === "visitors"
            ? "Visiteurs"
            : "Dashboard";

  return (
    <div className={`admin-app${page === "library" ? " admin-app-wide" : ""}`}>
      <header className="admin-topbar">
        <div>
          {page === "menu" ? null : <h1>{title}</h1>}
        </div>
        <button
          type="button"
          className="admin-burger"
          aria-label={page === "menu" ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => {
            if (page === "menu") {
              setPage(previousPage.current);
              return;
            }
            previousPage.current = page;
            setPage("menu");
          }}
        >
          {page === "menu" ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {page === "menu" ? (
        <AdminMenu
          onDashboard={() => {
            previousPage.current = "dashboard";
            setSection("overview");
            setPage("dashboard");
          }}
          onUsers={() => {
            previousPage.current = "dashboard";
            setSection("users");
            setPage("dashboard");
          }}
          onVisitors={() => {
            previousPage.current = "dashboard";
            setSection("visitors");
            setPage("dashboard");
          }}
          onLibrary={() => {
            previousPage.current = "library";
            setPage("library");
          }}
          onLogout={logout}
        />
      ) : null}

      {page === "library" ? <AdLibrary /> : null}

      {page === "dashboard" ? (
        <>
          {section === "users" || section === "visitors" ? null : (
            <nav className="admin-nav" aria-label="Sections">
              {(
                [
                  ["overview", "Vue d’ensemble"],
                  ["home", "Accueil"],
                  ["listings", "Annonces"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={section === id ? "is-active" : ""}
                  onClick={() => setSection(id)}
                >
                  {label}
                </button>
              ))}
            </nav>
          )}

      {section === "overview" ? (
        <section className="admin-section">
          <div className="admin-kpis">
            <Kpi label="Visiteurs uniques" value={overview.unique_visitors} hint="cookie persistant" />
            <Kpi label="Sessions" value={overview.total_sessions} hint={`${overview.sessions_24h} / 24 h`} />
            <Kpi
              label="Durée moyenne"
              valueLabel={formatDuration(overview.avg_duration_seconds)}
              hint="onglet visible"
            />
            <Kpi label="Utilisateurs" value={overview.users_count} hint="comptes inscrits" />
            <Kpi
              label="Annonces"
              value={overview.listings_count}
              hint={`${overview.listings_active} actives`}
            />
            <Kpi
              label="Vues annonces"
              value={overview.listing_session_views}
              hint="sessions uniques"
            />
          </div>

          <div className="admin-grid-2">
            <article className="admin-card">
              <h2>Provenance</h2>
              <SourceList rows={overview.top_sources} />
            </article>
            <article className="admin-card">
              <h2>Pages visitées</h2>
              <PageList rows={overview.top_pages} />
            </article>
          </div>
        </section>
      ) : null}

      {section === "home" ? (
        <section className="admin-section">
          <div className="admin-kpis">
            <Kpi label="Sessions accueil" value={overview.home_sessions} hint="une par session" />
            <Kpi label="Visiteurs accueil" value={overview.home_visitors} hint="uniques" />
            <Kpi
              label="Part des sessions"
              valueLabel={
                overview.total_sessions
                  ? `${Math.round((overview.home_sessions / overview.total_sessions) * 100)} %`
                  : "—"
              }
              hint="ont vu l’accueil"
            />
          </div>
          <article className="admin-card">
            <h2>Pages les plus vues</h2>
            <PageList rows={overview.top_pages} />
          </article>
        </section>
      ) : null}

      {section === "listings" ? (
        <section className="admin-section">
          <div className="admin-kpis">
            <Kpi label="Annonces créées" value={overview.listings_count} />
            <Kpi label="Actives" value={overview.listings_active} />
            <Kpi label="Vues (sessions)" value={overview.listing_session_views} />
          </div>
          <article className="admin-card">
            <div className="admin-card-head">
              <h2>Annonces</h2>
              <input
                className="admin-search"
                placeholder="Rechercher une annonce"
                value={listingQuery}
                onChange={(event) => setListingQuery(event.target.value)}
              />
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Annonce</th>
                    <th>Catégorie</th>
                    <th>Auteur</th>
                    <th>Statut</th>
                    <th>Vues</th>
                    <th>Créée</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="admin-empty">
                        Aucune annonce.
                      </td>
                    </tr>
                  ) : (
                    filteredListings.map((listing) => (
                      <tr key={listing.id}>
                        <td>
                          <Link href={getListingHref(listing.id, "sell")} className="admin-link">
                            {listing.title}
                          </Link>
                        </td>
                        <td>{listing.category}</td>
                        <td>{listing.owner_username ?? "—"}</td>
                        <td>{STATUS_LABELS[listing.status] ?? listing.status}</td>
                        <td className="admin-num">{formatViewCount(listing.session_views)}</td>
                        <td>{formatDay(listing.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}

      {section === "users" ? (
        <section className="admin-section">
          <div className="admin-kpis">
            <Kpi label="Utilisateurs" value={overview.users_count} />
          </div>
          <article className="admin-card">
            <div className="admin-card-head">
              <h2>Comptes</h2>
              <input
                className="admin-search"
                placeholder="Rechercher un utilisateur"
                value={userQuery}
                onChange={(event) => setUserQuery(event.target.value)}
              />
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Annonces</th>
                    <th>Inscrit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="admin-empty">
                        Aucun utilisateur.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          {user.username !== "—" ? (
                            <Link href={`/profil/${user.username}`} className="admin-link">
                              {user.username}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>{user.name || "—"}</td>
                        <td>
                          {user.profile_type
                            ? (PROFILE_LABELS[user.profile_type] ?? user.profile_type)
                            : "—"}
                        </td>
                        <td className="admin-num">{user.listings_count}</td>
                        <td>{formatDay(user.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}

      {section === "visitors" ? (
        <section className="admin-section">
          <div className="admin-kpis">
            <Kpi label="Visiteurs uniques" value={overview.unique_visitors} />
            <Kpi label="Sessions" value={overview.total_sessions} />
            <Kpi label="Actifs 24 h" value={overview.visitors_24h} />
          </div>
          <article className="admin-card">
            <h2>Visiteurs récents</h2>
            <div className="admin-visitor-list">
              {data.visitors.length === 0 ? (
                <p className="admin-empty">Aucun visiteur pour le moment.</p>
              ) : (
                data.visitors.map((visitor) => {
                  const open = openVisitor === visitor.id;
                  return (
                    <div key={visitor.id} className="admin-visitor">
                      <button
                        type="button"
                        className="admin-visitor-row"
                        onClick={() => setOpenVisitor(open ? null : visitor.id)}
                      >
                        <span className="admin-visitor-name">
                          {visitorLabel(visitor)}
                          {visitor.username ? (
                            <span className="admin-pill">Connecté</span>
                          ) : null}
                        </span>
                        <span>{visitor.session_count} session{visitor.session_count > 1 ? "s" : ""}</span>
                        <span>{formatDuration(visitor.total_duration_seconds)}</span>
                        <span>{formatDate(visitor.last_seen_at)}</span>
                      </button>
                      {open ? (
                        <div className="admin-visitor-sessions">
                          {visitor.sessions.length === 0 ? (
                            <p className="admin-empty">Pas de session enregistrée.</p>
                          ) : (
                            visitor.sessions.map((session) => (
                              <div key={session.id} className="admin-session">
                                <div className="admin-session-meta">
                                  <span>{formatDate(session.started_at)}</span>
                                  <span>{formatDuration(session.duration_seconds)}</span>
                                  <span>{session.source}</span>
                                </div>
                                <p className="admin-session-pages">
                                  {session.pages.join("  →  ")}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </article>
        </section>
      ) : null}
        </>
      ) : null}
    </div>
  );
}

function Kpi({
  label,
  value,
  valueLabel,
  hint,
}: {
  label: string;
  value?: number;
  valueLabel?: string;
  hint?: string;
}) {
  return (
    <article className="admin-kpi">
      <p className="admin-kpi-label">{label}</p>
      <p className="admin-kpi-value">
        {valueLabel ?? formatCompactNumber(value ?? 0)}
      </p>
      {hint ? <p className="admin-kpi-hint">{hint}</p> : null}
    </article>
  );
}

function SourceList({ rows }: { rows: { source: string; sessions: number }[] }) {
  if (rows.length === 0) {
    return <p className="admin-empty">Pas encore de trafic.</p>;
  }
  const max = Math.max(...rows.map((row) => row.sessions), 1);
  return (
    <ul className="admin-bars">
      {rows.map((row) => (
        <li key={row.source}>
          <div className="admin-bars-label">
            <span>{row.source}</span>
            <span>{row.sessions}</span>
          </div>
          <div className="admin-bar">
            <span style={{ width: `${Math.max(6, (row.sessions / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function PageList({ rows }: { rows: { path: string; sessions: number }[] }) {
  if (rows.length === 0) {
    return <p className="admin-empty">Aucune page vue.</p>;
  }
  return (
    <ul className="admin-pages">
      {rows.map((row) => (
        <li key={row.path}>
          <code>{row.path}</code>
          <span>{row.sessions} session{row.sessions > 1 ? "s" : ""}</span>
        </li>
      ))}
    </ul>
  );
}
