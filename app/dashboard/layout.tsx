import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { SiteContainer } from "@/components/layout/SiteContainer";
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
    <>
      <Header indigo />
      <main className="page-form min-h-[calc(100dvh-4.5rem)]">
        <SiteContainer className="py-10 md:py-14">{children}</SiteContainer>
      </main>
    </>
  );
}
