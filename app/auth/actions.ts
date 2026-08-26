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

export type AuthResult = {
  success: boolean;
  message: string;
};

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

  redirect("/dashboard");
}

export async function signInWithGoogle(formData: FormData) {
  const next = String(formData.get("next") ?? "/dashboard");
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    redirect("/connexion?error=google");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
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
