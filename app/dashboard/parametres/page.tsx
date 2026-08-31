import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { getUserProfile } from "@/lib/profile";
import { getUserBankAccount } from "@/lib/profile-bank";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";
import { PageMotion } from "@/components/layout/PageMotion";

export default async function ParametresPage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const [profile, bankAccount] = await Promise.all([
    getUserProfile(supabase, user.id),
    getUserBankAccount(supabase, user.id),
  ]);

  if (!profile) {
    return (
      <div className="settings-page mx-auto w-full max-w-[1200px] px-6 pb-16 pt-24 md:pb-20 md:pt-32">
        <PageMotion>
          <div className="settings-page-grid">
            <div className="settings-page-intro">
              <h1 className="marketing-section-title">Paramètres</h1>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
                Gérez votre profil public et vos informations de contact.
              </p>
            </div>
            <div className="settings-page-form">
              <div className="messages-empty">
                <p className="messages-empty-title">Profil indisponible</p>
                <p className="messages-empty-desc">
                  Impossible de charger votre profil pour le moment.
                </p>
              </div>
            </div>
          </div>
        </PageMotion>
      </div>
    );
  }

  return (
    <div className="settings-page mx-auto w-full max-w-[1200px] px-6 pb-16 pt-24 md:pb-20 md:pt-32">
      <PageMotion>
        <div className="settings-page-grid">
          <div className="settings-page-intro">
            <h1 className="marketing-section-title">Paramètres</h1>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
              Mettez à jour votre profil public, vos coordonnées et vos
              préférences de visibilité.
            </p>
          </div>

          <div className="settings-page-form">
            <ProfileSettingsForm
              profile={profile}
              bankAccount={bankAccount}
              userId={user.id}
              authEmail={user.email ?? ""}
            />
          </div>
        </div>
      </PageMotion>
    </div>
  );
}
