import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { getUserProfile } from "@/lib/profile";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";
import { PageMotion } from "@/components/layout/PageMotion";

export default async function ParametresPage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const profile = await getUserProfile(supabase, user.id);

  if (!profile) {
    return (
      <PageMotion className="dashboard-page">
        <h1 className="dashboard-page-title">Paramètres</h1>
        <div className="dashboard-empty">
          <p className="text-sm text-[var(--muted)]">
            Impossible de charger votre profil.
          </p>
        </div>
      </PageMotion>
    );
  }

  return (
    <PageMotion className="dashboard-page">
      <h1 className="dashboard-page-title">Paramètres</h1>

      <ProfileSettingsForm profile={profile} />
    </PageMotion>
  );
}
