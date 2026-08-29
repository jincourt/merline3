"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error || "Mot de passe incorrect.");
        return;
      }
      router.refresh();
    } catch {
      setError("Impossible de se connecter.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="admin-login">
      <form className="admin-login-card" onSubmit={onSubmit}>
        <p className="admin-login-kicker">Merline</p>
        <h1>Administration</h1>
        <p className="admin-login-copy">
          Entrez le mot de passe pour accéder aux statistiques du site.
        </p>
        <label className="admin-field">
          <span>Mot de passe</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="admin-login-error">{error}</p> : null}
        <button type="submit" className="admin-btn" disabled={pending}>
          {pending ? "Connexion…" : "Continuer"}
        </button>
      </form>
    </main>
  );
}
