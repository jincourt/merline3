"use client";

import Link from "next/link";
import { MotionDiv } from "@/components/ui/motion";
import { ProfileAvatar } from "@/components/profiles/ProfileAvatar";
import { ProfileReviewStars } from "@/components/profiles/ProfileReviewForm";
import { getAgentDisplayName, type PublicProfile } from "@/lib/agent-profiles";
import { getProfileHref } from "@/lib/profile-reviews";

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
          <Link href={getProfileHref(agent.username)} className="agent-directory-link">
            <article className="agent-directory-item">
              <ProfileAvatar
                name={agent.name}
                username={agent.username}
                avatarUrl={agent.avatarUrl}
                size="lg"
                className="agent-directory-avatar-slot"
              />
              <p className="agent-directory-name">{displayName}</p>
              <ProfileReviewStars
                rating={agent.averageRating ?? null}
                count={agent.reviewCount ?? 0}
                className="agent-directory-rating"
                singleStar
              />
            </article>
          </Link>
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
