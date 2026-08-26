import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageMotion } from "@/components/layout/PageMotion";

export default function PaiementSuccessPage() {
  return (
    <div className="page-form min-h-full">
      <Header light />
      <main className="border-b border-[var(--border)]">
        <PageMotion className="mx-auto max-w-[520px] px-6 py-10 text-center md:py-14">
          <h1 className="hero-title text-2xl">Paiement confirmé</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Merci ! Votre forfait est actif. Vous pouvez publier vos annonces.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/vendre" className="btn-primary">
              Publier une annonce
            </Link>
            <Link href="/dashboard" className="btn-ghost">
              Mon espace
            </Link>
          </div>
        </PageMotion>
      </main>
      <Footer light />
    </div>
  );
}
