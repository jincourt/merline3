"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateOtpCode,
  sendOtpEmail,
  storeOtpCode,
  verifyOtpCode,
} from "@/lib/email-otp";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  getSignupStatus,
  sanitizeNextPath,
  setupPath,
} from "@/lib/auth";

export type AuthResult = {
  success: boolean;
  message: string;
  redirectTo?: string;
};

export type UsernameAvailabilityResult = {
  available: boolean;
  message: string;
};

async function isUsernameTaken(username: string, excludeUserId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .neq("id", excludeUserId)
    .limit(1)
    .maybeSingle();

  return !!data;
}

export async function checkUsernameAvailability(
  username: string,
): Promise<UsernameAvailabilityResult> {
  const trimmed = username.trim();

  if (trimmed.length < 2) {
    return { available: true, message: "" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { available: false, message: "Non connecté." };
  }

  const taken = await isUsernameTaken(trimmed, user.id);
  if (taken) {
    return {
      available: false,
      message: "Ce nom d'utilisateur est déjà utilisé.",
    };
  }

  return { available: true, message: "" };
}

async function createSessionForEmail(email: string) {
  const admin = createAdminClient();
  const supabase = await createClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email: normalizedEmail,
    });

  const tokenHash = linkData?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    throw new Error("Impossible de créer la session.");
  }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "email",
  });

  if (verifyError) {
    throw new Error("Impossible de créer la session.");
  }
}

export async function sendEmailCode(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { success: false, message: "Entrez votre adresse email." };
  }

  try {
    const code = generateOtpCode();
    await storeOtpCode(email, code);
    await sendOtpEmail(email, code);
  } catch {
    return { success: false, message: "Impossible d'envoyer le code. Réessayez." };
  }

  return {
    success: true,
    message: "Un code vous a été envoyé par email.",
  };
}

export async function verifyEmailCode(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const inline = formData.get("inline") === "true";
  const next = String(formData.get("next") ?? "");

  if (!email || code.length < 6) {
    return { success: false, message: "Entrez le code reçu par email." };
  }

  const valid = await verifyOtpCode(email, code);
  if (!valid) {
    return { success: false, message: "Code invalide ou expiré." };
  }

  try {
    await createSessionForEmail(email);
  } catch {
    return { success: false, message: "Connexion impossible. Réessayez." };
  }

  revalidatePath("/", "layout");

  if (inline) {
    return { success: true, message: "Connecté." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const signupStatus = await getSignupStatus(user.id);

  if (signupStatus.isComplete) {
    redirect(sanitizeNextPath(next));
  }

  redirect(setupPath(next));
}

export async function signInWithGoogle(formData: FormData) {
  const next = sanitizeNextPath(String(formData.get("next") ?? "/"));
  redirect(`/auth/google?next=${encodeURIComponent(next)}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function setupUsername(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const username = String(formData.get("username") ?? "").trim();
  const next = String(formData.get("next") ?? "");
  const acceptTerms = formData.get("accept_terms") === "on";

  if (!acceptTerms) {
    return {
      success: false,
      message: "Tu dois accepter les Termes & Conditions et la Politique de confidentialité.",
    };
  }

  if (username.length < 2) {
    return {
      success: false,
      message: "Choisissez un nom d'utilisateur d'au moins 2 caractères.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Non connecté." };
  }

  const taken = await isUsernameTaken(username, user.id);
  if (taken) {
    return {
      success: false,
      message: "Ce nom d'utilisateur est déjà utilisé.",
    };
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      username,
      terms_accepted_at: now,
      updated_at: now,
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("setupUsername profile upsert failed:", error);
    if (error.code === "23505") {
      return {
        success: false,
        message: "Ce nom d'utilisateur est déjà utilisé.",
      };
    }
    const migrationHint = error.message.includes("terms_accepted_at")
      ? " Applique la migration Supabase terms_accepted_at."
      : "";
    return {
      success: false,
      message: `Impossible d'enregistrer le profil.${migrationHint}`,
    };
  }

  revalidatePath("/", "layout");

  return {
    success: true,
    message: "",
    redirectTo: sanitizeNextPath(next),
  };
}

export type ListingStatus = "active" | "paused" | "sold" | "closed" | "found";

export async function updateListingStatus(
  listingId: string,
  intent: "sell" | "buy",
  status: ListingStatus,
): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Non connecté." };
  }

  const table = intent === "sell" ? "products" : "buy_requests";
  const { error } = await supabase
    .from(table)
    .update({ status })
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: "Impossible de mettre à jour le statut." };
  }

  revalidatePath("/dashboard/annonces");
  return { success: true, message: "Statut mis à jour." };
}

export async function deleteListing(
  listingId: string,
  intent: "sell" | "buy",
): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Non connecté." };
  }

  const table = intent === "sell" ? "products" : "buy_requests";
  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: "Impossible de supprimer l'annonce." };
  }

  revalidatePath("/dashboard/annonces");
  return { success: true, message: "Annonce supprimée." };
}
