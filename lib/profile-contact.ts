import type { ProfileType } from "@/lib/profile-type";

export type ProfileContactVisibility = {
  contactEmail: string;
  phone: string;
  website: string;
  address: string;
  description: string;
  profileType: ProfileType | null;
  showEmail: boolean;
  showPhone: boolean;
  showWebsite: boolean;
  showAddress: boolean;
};

export type VisibleContactInfo = {
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  description: string | null;
};

export function getVisibleContactInfo(
  profile: ProfileContactVisibility,
  options?: { includeAnnonceurDescription?: boolean },
): VisibleContactInfo {
  return {
    email:
      profile.showEmail && profile.contactEmail.trim()
        ? profile.contactEmail.trim()
        : null,
    phone:
      profile.showPhone && profile.phone.trim() ? profile.phone.trim() : null,
    website:
      profile.showWebsite && profile.website.trim()
        ? profile.website.trim()
        : null,
    address:
      profile.showAddress && profile.address.trim()
        ? profile.address.trim()
        : null,
    description:
      options?.includeAnnonceurDescription &&
      profile.profileType === "annonceur" &&
      profile.description.trim()
        ? profile.description.trim()
        : null,
  };
}

export function hasVisibleContactInfo(info: VisibleContactInfo): boolean {
  return Boolean(
    info.email || info.phone || info.website || info.address || info.description,
  );
}

export function parseShowFlag(value: FormDataEntryValue | null): boolean {
  return String(value ?? "") === "1";
}
