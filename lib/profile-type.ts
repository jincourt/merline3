export const PROFILE_TYPES = ["annonceur", "agent"] as const;

export type ProfileType = (typeof PROFILE_TYPES)[number];

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  annonceur: "Annonceur",
  agent: "Agent",
};

export function isValidProfileType(value: string): value is ProfileType {
  return (PROFILE_TYPES as readonly string[]).includes(value);
}
