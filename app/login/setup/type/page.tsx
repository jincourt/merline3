import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteCard } from "@/components/layout/SiteCard";
import { SetupProfileTypeForm } from "@/components/auth/SetupProfileTypeForm";
import { MERLINE_GIF_INDIGO } from "@/lib/brand-assets";
import {
  getSignupStatus,
  getUser,
  sanitizeNextPath,
  setupPath,
} from "@/lib/auth";

export default async function LoginSetupTypePage({
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

  if (!signupStatus.hasProfileName || !signupStatus.hasAcceptedTerms) {
    redirect(setupPath(returnPath === "/" ? null : returnPath));
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
                src={MERLINE_GIF_INDIGO}
                alt="Merline"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                unoptimized
              />
            </Link>
          </div>

          <div className="mt-8">
            <SetupProfileTypeForm returnPath={returnPath} />
          </div>
        </SiteCard>
      </div>
    </main>
  );
}
