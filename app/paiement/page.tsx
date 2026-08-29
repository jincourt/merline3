import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageMotion } from "@/components/layout/PageMotion";
import { getUser } from "@/lib/auth";
import { isPlanId, PLANS, type PlanId } from "@/lib/plans";

export default async function PaiementPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: planParam } = await searchParams;
  const user = await getUser();

  if (!planParam || !isPlanId(planParam)) {
    redirect("/tarifs");
  }

  if (!user) {
    redirect(`/login?next=/paiement?plan=${planParam}`);
  }

  const plan = PLANS[planParam as PlanId];

  return (
    <div className="page-form min-h-full">
      <Header light />
      <main className="border-b border-[var(--border)]">
        <PageMotion className="mx-auto max-w-[520px] px-6 py-10 md:py-14">
          <Link
            href="/tarifs"
            className="btn-link text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Retour aux tarifs
          </Link>

          <div className="mt-6 border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
              Paiement sécurisé
            </p>
            <h1 className="hero-title mt-2 text-2xl">{plan.name}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{plan.description}</p>

            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-3xl font-medium">CHF {plan.price}.-</span>
              <span className="text-sm text-[var(--muted)]">{plan.period}</span>
            </div>

            <p className="mt-4 text-xs text-[var(--muted)]">
              Compte : {user.email}
            </p>

            <p className="mt-4 text-sm text-[var(--muted)]">
              Pour payer un forfait, publiez d&apos;abord une annonce — le paiement se
              fait à la fin du parcours.
            </p>

            <Link href="/vendre" className="btn-form btn-primary mt-6 block w-full text-center">
              Publier une annonce
            </Link>
          </div>
        </PageMotion>
      </main>
      <Footer light />
    </div>
  );
}
