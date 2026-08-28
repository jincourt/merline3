import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AgentsSearchPanel } from "@/components/agents/AgentsSearchPanel";
import { getAgentProfiles } from "@/lib/agents";

export const metadata: Metadata = {
  title: "Nos agents — Merline",
  description:
    "Parcourez le réseau d'agents Merline et trouvez un intermédiaire près de chez vous.",
};

export default async function AgentsPage() {
  const agents = await getAgentProfiles();

  return (
    <>
      <Header />
      <main className="section-dark flex-1">
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
          <AgentsSearchPanel agents={agents} />
        </div>
      </main>
      <Footer />
    </>
  );
}
