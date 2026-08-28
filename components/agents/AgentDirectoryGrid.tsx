"use client";

import { MotionDiv } from "@/components/ui/motion";
import { getAgentDisplayName, type PublicProfile } from "@/lib/agent-profiles";

type AgentDirectoryGridProps = {
  agents: PublicProfile[];
  emptyMessage?: string;
  className?: string;
  animate?: boolean;
};

export function AgentDirectoryGrid({
  agents,
  emptyMessage = "Aucun agent ne correspond à votre recherche.",
  className = "",
  animate = true,
}: AgentDirectoryGridProps) {
  if (agents.length === 0) {
    return (
      <div className={`agents-empty ${className}`.trim()}>
        <p className="text-sm text-[var(--muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className={`agent-directory-grid ${className}`.trim()}>
      {agents.map((agent, index) => {
        const displayName = getAgentDisplayName(agent);
        const content = (
          <article className="agent-directory-item">
            <div className="agent-directory-avatar" aria-hidden>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <p className="agent-directory-name">{displayName}</p>
          </article>
        );

        return (
          <li key={agent.id}>
            {animate ? <MotionDiv delay={index * 0.04}>{content}</MotionDiv> : content}
          </li>
        );
      })}
    </ul>
  );
}
