import type { ProfileType } from "@/lib/profile-type";

export type PublicProfile = {
  id: string;
  username: string;
  name: string;
  profileType: ProfileType;
  canton: string;
  npa: string;
};

export function getAgentDisplayName(
  agent: Pick<PublicProfile, "name" | "username">,
) {
  return agent.name || agent.username;
}

export function filterAgents(agents: PublicProfile[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return agents;

  return agents.filter((agent) => {
    const displayName = getAgentDisplayName(agent).toLowerCase();
    const username = agent.username.toLowerCase();
    const location = [agent.npa, agent.canton].filter(Boolean).join(" ").toLowerCase();

    return (
      displayName.includes(normalized) ||
      username.includes(normalized) ||
      location.includes(normalized)
    );
  });
}
