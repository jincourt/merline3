import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageMotion } from "@/components/layout/PageMotion";

export default function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  return (
    <div className="page-form min-h-full">
      <Header indigo />
      <main className="border-b border-[var(--border)]">
        <PageMotion className="mx-auto max-w-[440px] px-6 py-10 md:py-14">
          <Link
            href="/"
            className="btn-link text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Retour
          </Link>

          <div className="mt-6 border-b border-[var(--border)] pb-6">
            <h1 className="text-xl font-medium tracking-tight md:text-2xl">
              Se connecter
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              Entrez votre email — un code vous sera envoyé. Compte créé
              automatiquement si besoin.
            </p>
          </div>

          <ConnexionError searchParams={searchParams} />

          <div className="mt-8">
            <AuthForm />
          </div>
        </PageMotion>
      </main>
      <Footer light />
    </div>
  );
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
