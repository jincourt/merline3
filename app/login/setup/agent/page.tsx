import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteCard } from "@/components/layout/SiteCard";
import { SetupAgentDescriptionForm } from "@/components/auth/SetupAgentDescriptionForm";
import {
  getSignupStatus,
  getUser,
  sanitizeNextPath,
  setupPath,
  setupTypePath,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function LoginSetupAgentPage({
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

  if (!signupStatus.hasProfileType) {
    redirect(setupTypePath(returnPath === "/" ? null : returnPath));
  }

  if (!signupStatus.isAgent) {
    redirect(returnPath);
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("description")
    .eq("id", user.id)
    .maybeSingle();

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

          <div className="mt-8">
            <SetupAgentDescriptionForm
              returnPath={returnPath}
              initialDescription={profile?.description?.trim() ?? ""}
            />
          </div>
        </SiteCard>
      </div>
    </main>
  );
}
