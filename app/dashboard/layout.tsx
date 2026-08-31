import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Header } from "@/components/layout/Header";
import { SiteContainer } from "@/components/layout/SiteContainer";
import { getSignupStatus, getUser, incompleteSetupPath } from "@/lib/auth";

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
    redirect(incompleteSetupPath("/dashboard", signupStatus));
  }

  const pathname = (await headers()).get("x-pathname") ?? "";
  const isMessages = pathname.startsWith("/dashboard/messages");

  if (isMessages) {
    return (
      <>
        <Header light />
        <main className="section-light flex min-h-[calc(100dvh-4rem)] flex-col">{children}</main>
      </>
    );
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
