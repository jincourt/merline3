"use server";

import { createClient } from "@/lib/supabase/server";
import {
  VALID_LISTING_TYPES,
  VALID_COMMISSION_TYPES,
  type CommissionType,
  type ListingSource,
} from "@/lib/types";
import { revalidatePath } from "next/cache";

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

  const { error } = await supabase.from("products").insert({
    user_id: user.id,
    ...listingPayload(parsed.data, "sell"),
  });

  if (error) {
    console.error("submitProduct:", error.message);
    return {
      success: false,
      message:
        error.code === "23514"
          ? "Vérifiez le titre (2 caractères min.) et la description (10 caractères min.)."
          : "Impossible de publier l'annonce. Réessayez.",
    };
  }

  revalidateListingPaths("sell");
  return {
    success: true,
    message: "Votre annonce a été publiée avec succès.",
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
