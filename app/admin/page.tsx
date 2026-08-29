import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminDashboardData } from "@/lib/admin-stats";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLogin } from "@/components/admin/AdminLogin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return <AdminLogin />;
  }

  try {
    const data = await getAdminDashboardData();
    return <AdminDashboard data={data} />;
  } catch (error) {
    console.error("Admin dashboard failed:", error);
    return (
      <main className="admin-login">
        <div className="admin-login-card">
          <h1>Dashboard indisponible</h1>
          <p className="admin-login-copy">
            La migration analytics n&apos;est peut-être pas encore appliquée.
            Exécutez le fichier
            {" "}
            <code>supabase/migrations/20260829140000_add_analytics.sql</code>
            {" "}
            dans Supabase.
          </p>
        </div>
      </main>
    );
  }
}
