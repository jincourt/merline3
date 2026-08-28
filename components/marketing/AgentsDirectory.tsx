import Link from "next/link";
import { MotionDiv } from "@/components/ui/motion";
import { SectionShell } from "@/components/layout/SectionShell";
import { AgentDirectoryGrid } from "@/components/agents/AgentDirectoryGrid";
import { getAgentProfiles } from "@/lib/agents";

export async function AgentsDirectory() {
  const agents = await getAgentProfiles();

  return (
    <SectionShell id="nos-agents" variant="dark" className="border-b-0">
      <div className="mx-auto max-w-[1200px] px-6 pb-16 pt-0 md:pb-20">
        <AgentDirectoryGrid
          agents={agents}
          emptyMessage="Aucun agent inscrit pour le moment. Soyez parmi les premiers à rejoindre le réseau."
          className="agents-home-grid"
        />

        {agents.length > 0 ? (
          <MotionDiv delay={0.12} className="agents-section-cta">
            <Link href="/agents" className="btn-ghost btn-ghost-lg">
              Voir tous les agents
            </Link>
          </MotionDiv>
        ) : null}
      </div>
    </SectionShell>
  );
}
