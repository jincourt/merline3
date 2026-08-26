import { PageMotion } from "@/components/layout/PageMotion";

export default function ParametresPage() {
  return (
    <PageMotion className="dashboard-page">
      <h1 className="dashboard-page-title">Paramètres</h1>
      <p className="dashboard-page-desc">Gérez votre compte et vos préférences.</p>

      <div className="dashboard-empty">
        <p className="text-sm text-[var(--muted)]">
          Cette page est en cours de développement.
        </p>
      </div>
    </PageMotion>
  );
}
