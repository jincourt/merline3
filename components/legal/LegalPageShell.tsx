import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageMotion } from "@/components/layout/PageMotion";

export function LegalPageShell({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="page-form flex min-h-dvh flex-col bg-white">
      <Header light gifIndigo />
      <main className="flex-1 px-6 py-10 md:py-16">
        <PageMotion className="mx-auto max-w-[720px]">
          <Link href="/" className="btn-link-back">
            Retour à l&apos;accueil
          </Link>

          <header className="mt-8 border-b border-[var(--border)] pb-8">
            <h1 className="text-2xl font-medium tracking-tight md:text-3xl">{title}</h1>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Dernière mise à jour : {updatedAt}
            </p>
          </header>

          <article className="legal-prose mt-10">{children}</article>
        </PageMotion>
      </main>
      <Footer light />
    </div>
  );
}
