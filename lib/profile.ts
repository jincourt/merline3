import type { ProfileType } from "@/lib/profile-type";

export type UserProfile = {
  name: string;
  username: string;
  contactEmail: string;
  phone: string;
  website: string;
  address: string;
  npa: string;
  canton: string;
  profileType: ProfileType | null;
  description: string;
  avatarUrl: string;
  showEmail: boolean;
  showPhone: boolean;
  showWebsite: boolean;
  showAddress: boolean;
};

export async function getUserProfile(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
): Promise<UserProfile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("name, username, contact_email, phone, website, address, npa, canton, profile_type, description, avatar_url, show_email, show_phone, show_website, show_address")
    .eq("id", userId)
    .maybeSingle();

  if (!data) return null;

  return {
    name: data.name?.trim() ?? "",
    username: data.username?.trim() ?? "",
    contactEmail: data.contact_email?.trim() ?? "",
    phone: data.phone?.trim() ?? "",
    website: data.website?.trim() ?? "",
    address: data.address?.trim() ?? "",
    npa: data.npa?.trim() ?? "",
    canton: data.canton?.trim() ?? "",
    profileType: (data.profile_type as ProfileType | null) ?? null,
    description: data.description?.trim() ?? "",
    avatarUrl: data.avatar_url?.trim() ?? "",
    showEmail: Boolean(data.show_email),
    showPhone: Boolean(data.show_phone),
    showWebsite: Boolean(data.show_website),
    showAddress: Boolean(data.show_address),
  };
}

export function isValidAvatarUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = trimmed.includes("://")
      ? new URL(trimmed)
      : new URL(`https://${trimmed}`);
    return url.toString();
  } catch {
    return trimmed;
  }
}

export function isValidWebsite(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;

  try {
    const url = trimmed.includes("://")
      ? new URL(trimmed)
      : new URL(`https://${trimmed}`);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidNpa(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /^[1-9][0-9]{3}$/.test(trimmed);
}
