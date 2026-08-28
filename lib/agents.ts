import { createClient } from "@/lib/supabase/server";
import type { ProfileType } from "@/lib/profile-type";
import type { PublicProfile } from "@/lib/agent-profiles";

export type { PublicProfile } from "@/lib/agent-profiles";
export { getAgentDisplayName, filterAgents } from "@/lib/agent-profiles";

export async function getCommunityProfiles(): Promise<PublicProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, name, profile_type, canton, npa")
    .not("profile_type", "is", null)
    .not("username", "is", null)
    .order("username", { ascending: true });

  if (error) {
    console.error("getCommunityProfiles failed:", error);
    return [];
  }

  return (data ?? [])
    .filter((row) => row.username?.trim())
    .map((row) => ({
      id: row.id,
      username: row.username!.trim(),
      name: row.name?.trim() ?? "",
      profileType: row.profile_type as ProfileType,
      canton: row.canton?.trim() ?? "",
      npa: row.npa?.trim() ?? "",
    }));
}

export async function getAgentProfiles(): Promise<PublicProfile[]> {
  const profiles = await getCommunityProfiles();
  return profiles.filter((profile) => profile.profileType === "agent");
}
