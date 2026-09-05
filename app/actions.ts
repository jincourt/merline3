"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isValidAvatarUrl,
  isValidNpa,
  isValidWebsite,
  normalizeWebsite,
} from "@/lib/profile";
import {
  hasBankAccount,
  isValidBic,
  isValidIban,
} from "@/lib/profile-bank";
import { getProfileHref } from "@/lib/profile-reviews";
import { isValidProfileType } from "@/lib/profile-type";
import { isValidSwissCantonCode } from "@/lib/swiss-cantons";
import {
  isBoostPackId,
  isPlanId,
  type BoostPackId,
  type PlanId,
} from "@/lib/plans";
import {
  isSubscriptionCurrentlyActive,
  setSubscriptionAutoRenewPreference,
} from "@/lib/subscription";
import {
  VALID_LISTING_TYPES,
  VALID_COMMISSION_TYPES,
  type CommissionType,
  type ListingSource,
} from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function isValidListingType(value: string) {
  return VALID_LISTING_TYPES.includes(value as (typeof VALID_LISTING_TYPES)[number]);
}

function isValidListingSource(value: string): value is ListingSource {
  return value === "prod" || value === "buy";
}

function isValidCommissionType(value: string): value is CommissionType {
  return VALID_COMMISSION_TYPES.includes(value as CommissionType);
}

type ParsedListingForm = {
  listingId?: string;
  listingType: string;
  category: string;
  title: string;
  description: string;
  address: string;
  email: string;
  photos: string[];
  isFree?: boolean;
  price?: number | null;
  commissionType?: CommissionType;
  commissionValue?: number | null;
};

function parseListingFormData(
  formData: FormData,
  mode: "sell" | "buy",
):
  | { ok: true; data: ParsedListingForm }
  | { ok: false; message: string } {
  const listingId = String(formData.get("listing_id") ?? "").trim();
  const listingType = String(formData.get("listing_type") ?? "").trim();
  const categorySelect = String(formData.get("category") ?? "").trim();
  const customCategory = String(formData.get("custom_category") ?? "").trim();
  const category =
    categorySelect === "Personnalisé" ? customCategory : categorySelect;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  let address = String(formData.get("address") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const photosRaw = String(formData.get("photos") ?? "[]");

  if (!isValidListingType(listingType)) {
    return { ok: false, message: "Veuillez remplir tous les champs obligatoires." };
  }

  if (!category || !title || !description) {
    return { ok: false, message: "Veuillez remplir tous les champs obligatoires." };
  }

  if (title.length < 2) {
    return { ok: false, message: "Le titre doit contenir au moins 2 caractères." };
  }

  if (description.length < 10) {
    return {
      ok: false,
      message: "La description doit contenir au moins 10 caractères.",
    };
  }

  let photos: string[] = [];
  try {
    photos = JSON.parse(photosRaw);
    if (!Array.isArray(photos)) photos = [];
  } catch {
    photos = [];
  }

  if (mode === "sell") {
    const commissionType = String(formData.get("commission_type") ?? "").trim();
    const commissionValueRaw = String(formData.get("commission_value") ?? "").trim();

    if (!isValidCommissionType(commissionType)) {
      return {
        ok: false,
        message: "Choisissez un type de commission valide.",
      };
    }

    let commissionValue: number | null = commissionValueRaw
      ? Number(commissionValueRaw)
      : null;

    if (
      commissionValue === null ||
      Number.isNaN(commissionValue) ||
      commissionValue < 0
    ) {
      return {
        ok: false,
        message: "Indiquez une commission valide.",
      };
    }

    if (commissionType === "percent" && commissionValue > 100) {
      return {
        ok: false,
        message: "Le pourcentage ne peut pas dépasser 100 %.",
      };
    }

    const priceRaw = String(formData.get("price") ?? "").trim();
    const price = priceRaw ? Number(priceRaw) : null;

    if (price === null || Number.isNaN(price) || price < 0) {
      return {
        ok: false,
        message:
          commissionType === "percent"
            ? "Indiquez un prix moyen valide."
            : "Indiquez un prix valide.",
      };
    }

    return {
      ok: true,
      data: {
        listingId: listingId || undefined,
        listingType,
        category,
        title,
        description,
        address,
        email,
        photos,
        commissionType,
        commissionValue,
        price,
      },
    };
  }

  const isFree = formData.get("is_free") === "on";
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = isFree ? null : priceRaw ? Number(priceRaw) : null;

  if (!isFree && (price === null || Number.isNaN(price) || price < 0)) {
    return {
      ok: false,
      message: "Indiquez un budget valide ou cochez « Budget flexible ».",
    };
  }

  return {
    ok: true,
    data: {
      listingId: listingId || undefined,
      listingType,
      category,
      title,
      description,
      address,
      email,
      photos,
      isFree,
      price,
    },
  };
}

function productListingPayload(data: ParsedListingForm) {
  return {
    listing_type: data.listingType,
    category: data.category,
    title: data.title,
    description: data.description,
    commission_type: data.commissionType,
    commission_value: data.commissionValue ?? null,
    price: data.price ?? null,
    address: data.address,
    email: data.email || null,
    photos: data.photos,
  };
}

function buyListingPayload(data: ParsedListingForm) {
  return {
    listing_type: data.listingType,
    category: data.category,
    title: data.title,
    description: data.description,
    price: data.price ?? null,
    is_free: data.isFree ?? false,
    address: data.address,
    email: data.email || null,
    photos: data.photos,
  };
}

function listingPayload(data: ParsedListingForm, mode: "sell" | "buy") {
  return mode === "sell" ? productListingPayload(data) : buyListingPayload(data);
}

function revalidateListingPaths(mode: "sell" | "buy", listingId?: string) {
  revalidatePath("/");
  revalidatePath("/dashboard/annonces");
  if (mode === "sell") {
    revalidatePath("/");
    revalidatePath("/vendre");
  }
  if (listingId) {
    revalidatePath(`/annonce/${mode === "sell" ? "prod" : "buy"}/${listingId}`);
    revalidatePath(`/dashboard/annonces/${mode}/${listingId}/modifier`);
  }
}

export type ActionResult = {
  success: boolean;
  message: string;
  listingId?: string;
  redirectTo?: string;
};

export type FavoriteActionResult = ActionResult & {
  favorited?: boolean;
  favoriteCount?: number;
};

export async function submitContactRequest(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!email || !email.includes("@")) {
    return {
      success: false,
      message: "Veuillez entrer un email valide.",
    };
  }

  if (phone.length < 8) {
    return {
      success: false,
      message: "Veuillez entrer un numéro valide.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_requests").insert({ email, phone });

  if (error) {
    return {
      success: false,
      message: "Impossible d'enregistrer votre numéro. Réessayez.",
    };
  }

  revalidatePath("/");
  return {
    success: true,
    message: "Merci ! Nous vous contactons très bientôt.",
  };
}

export async function submitProduct(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Connectez-vous pour publier une annonce.",
    };
  }

  const parsed = parseListingFormData(formData, "sell");
  if (!parsed.ok) {
    return { success: false, message: parsed.message };
  }

  const { data: inserted, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      status: "draft",
      ...listingPayload(parsed.data, "sell"),
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("submitProduct:", error?.message);
    return {
      success: false,
      message:
        error?.code === "23514"
          ? "Vérifiez le titre (2 caractères min.) et la description (10 caractères min.)."
          : "Impossible d'enregistrer l'annonce. Réessayez.",
    };
  }

  revalidateListingPaths("sell");
  return {
    success: true,
    message: "Annonce enregistrée.",
    listingId: inserted.id,
  };
}

export async function saveListingCheckout(
  listingId: string,
  planId: string,
  boostId: string | null,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Connectez-vous pour continuer." };
  }

  if (!isPlanId(planId)) {
    return { success: false, message: "Choisissez un forfait valide." };
  }

  if (boostId && !isBoostPackId(boostId)) {
    return { success: false, message: "Option publicitaire invalide." };
  }

  const { data: listing } = await supabase
    .from("products")
    .select("id, status, user_id")
    .eq("id", listingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!listing) {
    return { success: false, message: "Annonce introuvable." };
  }

  if (listing.status !== "draft" && listing.status !== "pending_payment") {
    return { success: false, message: "Cette annonce ne peut plus être modifiée." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("merline_pro_active, merline_pro_expires_at")
    .eq("id", user.id)
    .maybeSingle();

  const hasActivePro = profile ? isSubscriptionCurrentlyActive(profile) : false;
  const skipPayment =
    hasActivePro && planId === "abonnement" && !boostId;

  const { error } = await supabase
    .from("products")
    .update({
      checkout_plan: planId,
      checkout_boost: boostId,
      status: skipPayment ? "active" : "pending_payment",
    })
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (error) {
    console.error("saveListingCheckout:", error.message);
    return { success: false, message: "Impossible d'enregistrer votre choix." };
  }

  revalidateListingPaths("sell", listingId);

  if (skipPayment) {
    return {
      success: true,
      message: "Annonce publiée.",
      redirectTo: "/dashboard/annonces?published=1",
    };
  }

  return {
    success: true,
    message: "Choix enregistré.",
    redirectTo: `/vendre/paiement?listing=${listingId}`,
  };
}

export async function updateProduct(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Connectez-vous pour modifier l'annonce." };
  }

  const parsed = parseListingFormData(formData, "sell");
  if (!parsed.ok) {
    return { success: false, message: parsed.message };
  }

  if (!parsed.data.listingId) {
    return { success: false, message: "Annonce introuvable." };
  }

  const { error } = await supabase
    .from("products")
    .update(listingPayload(parsed.data, "sell"))
    .eq("id", parsed.data.listingId)
    .eq("user_id", user.id);

  if (error) {
    console.error("updateProduct:", error.message);
    return { success: false, message: "Impossible de modifier l'annonce." };
  }

  revalidateListingPaths("sell", parsed.data.listingId);
  return { success: true, message: "Annonce mise à jour." };
}

export async function submitBuyRequest(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Connectez-vous pour envoyer votre demande.",
    };
  }

  const parsed = parseListingFormData(formData, "buy");
  if (!parsed.ok) {
    return { success: false, message: parsed.message };
  }

  const { error } = await supabase.from("buy_requests").insert({
    user_id: user.id,
    ...listingPayload(parsed.data, "buy"),
  });

  if (error) {
    console.error("submitBuyRequest:", error.message);
    return {
      success: false,
      message:
        error.code === "23514"
          ? "Vérifiez le titre (2 caractères min.) et la description (10 caractères min.)."
          : "Impossible d'envoyer votre demande. Réessayez.",
    };
  }

  revalidateListingPaths("buy");
  return {
    success: true,
    message: "Votre demande a été envoyée. Merline s'occupe de la suite.",
  };
}

export async function updateBuyRequest(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Connectez-vous pour modifier l'annonce." };
  }

  const parsed = parseListingFormData(formData, "buy");
  if (!parsed.ok) {
    return { success: false, message: parsed.message };
  }

  if (!parsed.data.listingId) {
    return { success: false, message: "Annonce introuvable." };
  }

  const { error } = await supabase
    .from("buy_requests")
    .update(listingPayload(parsed.data, "buy"))
    .eq("id", parsed.data.listingId)
    .eq("user_id", user.id);

  if (error) {
    console.error("updateBuyRequest:", error.message);
    return { success: false, message: "Impossible de modifier l'annonce." };
  }

  revalidateListingPaths("buy", parsed.data.listingId);
  return { success: true, message: "Annonce mise à jour." };
}

export type ConversationActionResult = ActionResult & {
  convId?: string;
};

export async function startConversation(
  _prev: ConversationActionResult | null,
  formData: FormData,
): Promise<ConversationActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Connectez-vous pour envoyer un message.",
    };
  }

  const listingId = String(formData.get("listing_id") ?? "").trim();
  const src = String(formData.get("src") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!listingId || !isValidListingSource(src) || body.length < 1) {
    return {
      success: false,
      message: "Message invalide.",
    };
  }

  const table = src === "prod" ? "products" : "buy_requests";
  const { data: listing } = await supabase
    .from(table)
    .select("id, user_id, title, status")
    .eq("id", listingId)
    .maybeSingle();

  if (!listing || listing.status !== "active") {
    return {
      success: false,
      message: "Annonce introuvable.",
    };
  }

  if (!listing.user_id) {
    return {
      success: false,
      message: "Impossible de contacter l'annonceur.",
    };
  }

  if (listing.user_id === user.id) {
    return {
      success: false,
      message: "Vous ne pouvez pas vous envoyer un message.",
    };
  }

  let convId: string | undefined;

  const { data: existingConv } = await supabase
    .from("convs")
    .select("id")
    .eq("listing_id", listingId)
    .eq("src", src)
    .eq("peer_id", user.id)
    .maybeSingle();

  if (existingConv) {
    convId = existingConv.id;
  } else {
    const { data: newConv, error: convError } = await supabase
      .from("convs")
      .insert({
        listing_id: listingId,
        src,
        owner_id: listing.user_id,
        peer_id: user.id,
      })
      .select("id")
      .single();

    if (convError || !newConv) {
      console.error("startConversation:", convError?.message);
      return {
        success: false,
        message: "Impossible de créer la conversation.",
      };
    }

    convId = newConv.id;
  }

  const { error: msgError } = await supabase.from("conv_msgs").insert({
    conv_id: convId,
    sender_id: user.id,
    body,
  });

  if (msgError) {
    console.error("startConversation msg:", msgError.message);
    return {
      success: false,
      message: "Impossible d'envoyer le message.",
    };
  }

  await supabase
    .from("convs")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", convId);

  revalidatePath("/dashboard/messages");
  revalidatePath(`/dashboard/messages/${convId}`);

  return {
    success: true,
    message: "Message envoyé.",
    convId,
  };
}

export async function startProfileConversation(
  _prev: ConversationActionResult | null,
  formData: FormData,
): Promise<ConversationActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Connectez-vous pour envoyer un message.",
    };
  }

  const profileId = String(formData.get("profile_id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!profileId || body.length < 1) {
    return {
      success: false,
      message: "Message invalide.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profileId)
    .maybeSingle();

  if (!profile) {
    return {
      success: false,
      message: "Profil introuvable.",
    };
  }

  if (profile.id === user.id) {
    return {
      success: false,
      message: "Vous ne pouvez pas vous envoyer un message.",
    };
  }

  let convId: string | undefined;

  const { data: existingConv } = await supabase
    .from("convs")
    .select("id")
    .eq("listing_id", profile.id)
    .eq("src", "profile")
    .eq("peer_id", user.id)
    .maybeSingle();

  if (existingConv) {
    convId = existingConv.id;
  } else {
    const { data: newConv, error: convError } = await supabase
      .from("convs")
      .insert({
        listing_id: profile.id,
        src: "profile",
        owner_id: profile.id,
        peer_id: user.id,
      })
      .select("id")
      .single();

    if (convError || !newConv) {
      console.error("startProfileConversation:", convError?.message);
      return {
        success: false,
        message: "Impossible de créer la conversation.",
      };
    }

    convId = newConv.id;
  }

  const { error: msgError } = await supabase.from("conv_msgs").insert({
    conv_id: convId,
    sender_id: user.id,
    body,
  });

  if (msgError) {
    console.error("startProfileConversation msg:", msgError.message);
    return {
      success: false,
      message: "Impossible d'envoyer le message.",
    };
  }

  await supabase
    .from("convs")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", convId);

  revalidatePath("/dashboard/messages");
  revalidatePath(`/dashboard/messages/${convId}`);

  return {
    success: true,
    message: "Message envoyé.",
    convId,
  };
}

export async function sendConvMessage(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Connectez-vous pour répondre.",
    };
  }

  const convId = String(formData.get("conv_id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!convId || body.length < 1) {
    return {
      success: false,
      message: "Message invalide.",
    };
  }

  const { data: conv } = await supabase
    .from("convs")
    .select("id, owner_id, peer_id")
    .eq("id", convId)
    .maybeSingle();

  if (!conv || (conv.owner_id !== user.id && conv.peer_id !== user.id)) {
    return {
      success: false,
      message: "Conversation introuvable.",
    };
  }

  const { error } = await supabase.from("conv_msgs").insert({
    conv_id: convId,
    sender_id: user.id,
    body,
  });

  if (error) {
    console.error("sendConvMessage:", error.message);
    return {
      success: false,
      message: "Impossible d'envoyer le message.",
    };
  }

  await supabase
    .from("convs")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", convId);

  revalidatePath("/dashboard/messages");
  revalidatePath(`/dashboard/messages/${convId}`);

  return {
    success: true,
    message: "Message envoyé.",
  };
}

export async function toggleFavorite(
  listingId: string,
  src: ListingSource,
): Promise<FavoriteActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Connectez-vous pour enregistrer cette annonce.",
    };
  }

  if (!isValidListingSource(src)) {
    return {
      success: false,
      message: "Annonce introuvable.",
    };
  }

  const table = src === "prod" ? "products" : "buy_requests";

  async function readFavoriteCount() {
    const { data } = await supabase
      .from(table)
      .select("favorite_count")
      .eq("id", listingId)
      .maybeSingle();
    return Number(data?.favorite_count ?? 0) || 0;
  }

  const { data: listing } = await supabase
    .from(table)
    .select("id, status")
    .eq("id", listingId)
    .maybeSingle();

  if (!listing || listing.status !== "active") {
    return {
      success: false,
      message: "Annonce introuvable.",
    };
  }

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .eq("src", src)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("id", existing.id);

    if (error) {
      console.error("toggleFavorite delete:", error.message);
      return {
        success: false,
        message: "Impossible de retirer des favoris.",
      };
    }

    revalidatePath("/dashboard/favoris");
    revalidatePath(`/annonce/${src}/${listingId}`);
    revalidatePath("/");

    return {
      success: true,
      message: "Annonce retirée des favoris.",
      favorited: false,
      favoriteCount: await readFavoriteCount(),
    };
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    listing_id: listingId,
    src,
  });

  if (error) {
    console.error("toggleFavorite insert:", error.message);
    return {
      success: false,
      message: "Impossible d'ajouter aux favoris.",
    };
  }

  revalidatePath("/dashboard/favoris");
  revalidatePath(`/annonce/${src}/${listingId}`);
  revalidatePath("/");

  return {
    success: true,
    message: "Annonce ajoutée aux favoris.",
    favorited: true,
    favoriteCount: await readFavoriteCount(),
  };
}

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

export async function updateProfile(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Connectez-vous pour modifier votre profil." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const websiteRaw = String(formData.get("website") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const npa = String(formData.get("npa") ?? "").trim();
  const canton = String(formData.get("canton") ?? "").trim().toUpperCase();
  const profileTypeRaw = String(formData.get("profile_type") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const showEmail = String(formData.get("show_email") ?? "") === "1";
  const showPhone = String(formData.get("show_phone") ?? "") === "1";
  const showWebsite = String(formData.get("show_website") ?? "") === "1";
  const showAddress = String(formData.get("show_address") ?? "") === "1";
  const bankAccountName = String(formData.get("bank_account_name") ?? "").trim();
  const bankIban = String(formData.get("bank_iban") ?? "").trim();
  const bankBic = String(formData.get("bank_bic") ?? "").trim();
  const bankName = String(formData.get("bank_name") ?? "").trim();
  const avatarUrlRaw = String(formData.get("avatar_url") ?? "").trim();

  if (!isValidProfileType(profileTypeRaw)) {
    return {
      success: false,
      message: "Choisissez un type de profil valide.",
    };
  }

  if (name.length < 2) {
    return {
      success: false,
      message: "Votre nom doit contenir au moins 2 caractères.",
    };
  }

  if (username.length < 2) {
    return {
      success: false,
      message: "Le nom d'utilisateur doit contenir au moins 2 caractères.",
    };
  }

  if (phone && phone.length < 8) {
    return {
      success: false,
      message: "Le numéro de téléphone doit contenir au moins 8 caractères.",
    };
  }

  if (!isValidWebsite(websiteRaw)) {
    return {
      success: false,
      message: "L'adresse du site internet n'est pas valide.",
    };
  }

  if (!isValidNpa(npa)) {
    return {
      success: false,
      message: "Le NPA doit contenir 4 chiffres.",
    };
  }

  if (canton && !isValidSwissCantonCode(canton)) {
    return {
      success: false,
      message: "Veuillez sélectionner un canton valide.",
    };
  }

  if (description.length > 2000) {
    return {
      success: false,
      message: "La description ne peut pas dépasser 2000 caractères.",
    };
  }

  if (!isValidIban(bankIban)) {
    return {
      success: false,
      message: "L'IBAN n'est pas valide.",
    };
  }

  if (!isValidBic(bankBic)) {
    return {
      success: false,
      message: "Le BIC/SWIFT n'est pas valide.",
    };
  }

  if (!isValidAvatarUrl(avatarUrlRaw)) {
    return {
      success: false,
      message: "L'URL de la photo de profil n'est pas valide.",
    };
  }

  const bankPayload = {
    account_name: bankAccountName || null,
    iban: bankIban || null,
    bic: bankBic || null,
    bank_name: bankName || null,
    updated_at: new Date().toISOString(),
  };

  if (
    hasBankAccount({
      accountName: bankAccountName,
      iban: bankIban,
      bic: bankBic,
      bankName,
    }) &&
    (!bankAccountName || !bankIban)
  ) {
    return {
      success: false,
      message: "Indiquez au minimum le nom du compte et l'IBAN.",
    };
  }

  const taken = await isUsernameTaken(username, user.id);
  if (taken) {
    return {
      success: false,
      message: "Ce nom d'utilisateur est déjà utilisé.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name,
      username,
      contact_email: user.email?.trim() || null,
      phone: phone || null,
      website: websiteRaw ? normalizeWebsite(websiteRaw) : null,
      address: address || null,
      npa: npa || null,
      canton: canton || null,
      profile_type: profileTypeRaw,
      description: description || null,
      avatar_url: avatarUrlRaw || null,
      show_email: showEmail && Boolean(user.email?.trim()),
      show_phone: showPhone && Boolean(phone),
      show_website: showWebsite && Boolean(websiteRaw),
      show_address: showAddress && Boolean(address),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("updateProfile:", error.message);
    const migrationHint = error.message.includes("website")
      || error.message.includes("address")
      || error.message.includes("npa")
      || error.message.includes("canton")
      || error.message.includes("profile_type")
      || error.message.includes("name")
      || error.message.includes("description")
      || error.message.includes("avatar_url")
      || error.message.includes("contact_email")
      || error.message.includes("show_")
      ? " Applique les migrations Supabase récentes."
      : "";
    return {
      success: false,
      message: `Impossible d'enregistrer le profil.${migrationHint}`,
    };
  }

  if (
    hasBankAccount({
      accountName: bankAccountName,
      iban: bankIban,
      bic: bankBic,
      bankName,
    })
  ) {
    const { error: bankError } = await supabase
      .from("profile_bank_accounts")
      .upsert({
        profile_id: user.id,
        ...bankPayload,
      });

    if (bankError) {
      console.error("updateProfile bank:", bankError.message);
      return {
        success: false,
        message: "Profil enregistré, mais impossible d'enregistrer le compte bancaire.",
      };
    }
  } else {
    await supabase.from("profile_bank_accounts").delete().eq("profile_id", user.id);
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/parametres");
  revalidatePath("/agents");
  revalidatePath(`/profil/${encodeURIComponent(username)}`);

  return {
    success: true,
    message: "Profil enregistré.",
  };
}

export async function submitProfileReview(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Connectez-vous pour laisser un avis." };
  }

  const profileId = String(formData.get("profile_id") ?? "").trim();
  const ratingRaw = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();
  const listingId = String(formData.get("listing_id") ?? "").trim();
  const listingSrc = String(formData.get("listing_src") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();

  if (!profileId) {
    return { success: false, message: "Profil introuvable." };
  }

  if (profileId === user.id) {
    return { success: false, message: "Vous ne pouvez pas vous évaluer vous-même." };
  }

  if (!Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
    return { success: false, message: "Choisissez une note entre 1 et 5." };
  }

  if (comment.length > 1000) {
    return { success: false, message: "Le commentaire est trop long." };
  }

  const payload = {
    profile_id: profileId,
    reviewer_id: user.id,
    rating: ratingRaw,
    comment,
    listing_id: listingId || null,
    listing_src:
      listingSrc === "prod" || listingSrc === "buy" ? listingSrc : null,
  };

  const { error } = await supabase.from("profile_reviews").upsert(payload, {
    onConflict: "profile_id,reviewer_id",
  });

  if (error) {
    console.error("submitProfileReview:", error.message);
    const migrationHint = error.message.includes("profile_reviews")
      ? " Applique la migration Supabase récente."
      : "";
    return {
      success: false,
      message: `Impossible d'enregistrer l'avis.${migrationHint}`,
    };
  }

  if (username) {
    revalidatePath(getProfileHref(username));
  }
  revalidatePath("/agents");

  if (listingId && (listingSrc === "prod" || listingSrc === "buy")) {
    revalidatePath(`/annonce/${listingSrc}/${listingId}`);
  }

  return { success: true, message: "Avis enregistré." };
}

export async function confirmSubscriptionRenewal(
  autoRenew: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Connectez-vous pour continuer." };
  }

  const result = await setSubscriptionAutoRenewPreference(user.id, autoRenew);

  if (!result.ok) {
    return { success: false, message: result.message };
  }

  revalidatePath("/dashboard/annonces");
  revalidatePath("/dashboard/parametres");

  return {
    success: true,
    message: autoRenew
      ? "Renouvellement automatique activé."
      : "Votre abonnement se terminera à la fin de la période en cours.",
  };
}

export async function updateSubscriptionAutoRenew(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Connectez-vous pour continuer." };
  }

  const autoRenew = formData.get("auto_renew") === "1";
  const result = await setSubscriptionAutoRenewPreference(user.id, autoRenew);

  if (!result.ok) {
    return { success: false, message: result.message };
  }

  revalidatePath("/dashboard/parametres");

  return {
    success: true,
    message: autoRenew
      ? "Renouvellement automatique activé."
      : "Renouvellement automatique désactivé — l'abonnement se terminera à la date indiquée.",
  };
}
