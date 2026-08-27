import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteCard } from "@/components/layout/SiteCard";
import { UsernameSetupForm } from "@/components/auth/UsernameSetupForm";
import { getSignupStatus, getUser, sanitizeNextPath } from "@/lib/auth";

export default async function LoginSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const signupStatus = await getSignupStatus(user.id);
  const { next } = await searchParams;
  const returnPath = sanitizeNextPath(next);

  if (signupStatus.isComplete) {
    redirect(returnPath);
  }

  return (
    <main className="page-form grid min-h-dvh flex-1 w-full place-items-center px-6">
      <div className="w-full max-w-[440px]">
        <SiteCard variant="outline">
          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--indigo)]"
            >
              <Image
                src="/merline.gif"
                alt="Merline"
                width={40}
                height={40}
                className="h-10 w-10 object-contain merline-gif-indigo"
                unoptimized
              />
            </Link>
          </div>

          <h1 className="mt-4 text-center text-xl font-medium tracking-tight md:text-2xl">
            Terminer l&apos;inscription
          </h1>

          <div className="mt-8">
            <UsernameSetupForm
              returnPath={returnPath}
              defaultUsername={signupStatus.profileName ?? ""}
            />
          </div>
        </SiteCard>
      </div>
    </main>
  );
}
