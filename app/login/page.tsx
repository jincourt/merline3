import Image from "next/image";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { SiteCard } from "@/components/layout/SiteCard";
import { MERLINE_GIF_INDIGO } from "@/lib/brand-assets";
import { sanitizeNextPath } from "@/lib/auth";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  return (
    <main className="page-form flex min-h-dvh flex-1 w-full items-center justify-center px-6 py-10">
      <div className="w-full max-w-[440px]">
        <SiteCard variant="outline">
          <div className="flex justify-center">
            <Link href="/" className="inline-flex rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--indigo)]">
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

          <h1 className="mt-4 text-center text-xl font-medium tracking-tight md:text-2xl">
            Se connecter à Merline
          </h1>

          <LoginError searchParams={searchParams} />

          <div className="mt-8">
            <LoginAuthForm searchParams={searchParams} />
          </div>
        </SiteCard>
      </div>
    </main>
  );
}

async function LoginAuthForm({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const returnPath = sanitizeNextPath(next);

  return <AuthForm returnPath={returnPath} />;
}

async function LoginError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  if (!error) return null;

  const message =
    error === "auth"
      ? "La connexion a échoué. Réessayez."
      : error === "google"
        ? "Connexion Google indisponible."
        : "Une erreur est survenue.";

  return (
    <p className="mt-4 text-center text-sm text-[var(--error)]" role="alert">
      {message}
    </p>
  );
}
