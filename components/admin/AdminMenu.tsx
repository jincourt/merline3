"use client";

export function AdminMenu({
  onDashboard,
  onUsers,
  onVisitors,
  onLibrary,
  onLogout,
}: {
  onDashboard: () => void;
  onUsers: () => void;
  onVisitors: () => void;
  onLibrary: () => void;
  onLogout: () => void;
}) {
  return (
    <section className="admin-menu">
      <p className="admin-brand">Merline</p>
      <h1>Merline Menu</h1>
      <nav className="admin-menu-list" aria-label="Menu admin">
        <button type="button" onClick={onDashboard}>
          Dashboard
        </button>
        <button type="button" onClick={onUsers}>
          Utilisateurs
        </button>
        <button type="button" onClick={onVisitors}>
          Visiteurs
        </button>
        <button type="button" onClick={onLibrary}>
          Library
        </button>
        <button type="button" className="admin-menu-logout" onClick={onLogout}>
          Déconnexion
        </button>
      </nav>
    </section>
  );
}
