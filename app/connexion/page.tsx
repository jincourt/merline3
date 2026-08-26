import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageMotion } from "@/components/layout/PageMotion";

export default function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  return (
    <div className="page-form flex min-h-dvh flex-col bg-white">
      <Header light gifIndigo />
      <main className="flex flex-1 items-center justify-center px-6 py-8 md:py-12">
        <PageMotion className="w-full max-w-[400px] text-left">
          <Link href="/" className="btn-link-back">
            Retour
          </Link>

            <div className="mt-6 border-b border-[var(--border)] text-center">
              <h1 className="text-xl font-medium tracking-tight md:text-2xl">
                Se connecter
              </h1>
            </div>

            <ConnexionError searchParams={searchParams} />

            <div className="mt-8">
              <ConnexionAuthForm searchParams={searchParams} />
            </div>
          </PageMotion>
      </main>
    </div>
  );
}

async function ConnexionAuthForm({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const returnPath = next?.startsWith("/") ? next : "/dashboard";

  return <AuthForm returnPath={returnPath} />;
}

async function ConnexionError({
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
    <p className="mt-4 text-sm text-[var(--error)]" role="alert">
      {message}
    </p>
  );
}
