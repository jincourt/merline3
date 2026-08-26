import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { getUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/connexion?next=/dashboard");
  }

  return (
    <div className="dashboard-app min-h-full">
      <div className="dashboard-shell">
        <DashboardSidebar />
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
