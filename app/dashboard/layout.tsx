import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { getSignupStatus, getUser, setupPath } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const signupStatus = await getSignupStatus(user.id);

  if (!signupStatus.isComplete) {
    redirect(setupPath("/dashboard"));
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
