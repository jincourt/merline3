export type UserProfile = {
  username: string;
  phone: string;
  website: string;
  address: string;
  npa: string;
  canton: string;
};

export async function getUserProfile(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
): Promise<UserProfile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("username, phone, website, address, npa, canton")
    .eq("id", userId)
    .maybeSingle();

  if (!data) return null;

  return {
    username: data.username?.trim() ?? "",
    phone: data.phone?.trim() ?? "",
    website: data.website?.trim() ?? "",
    address: data.address?.trim() ?? "",
    npa: data.npa?.trim() ?? "",
    canton: data.canton?.trim() ?? "",
  };
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
