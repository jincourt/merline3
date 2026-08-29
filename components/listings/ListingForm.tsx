"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { submitProduct, submitBuyRequest, updateProduct, updateBuyRequest } from "@/app/actions";
import { AuthDialog } from "@/components/auth/AuthDialog";
import {
  clearFormDraft,
  loadFormDraft,
  saveFormDraft,
  type FormDraft,
} from "@/lib/form-draft";
import {
  getCategoriesForType,
  isPhysicalListingType,
  LISTING_TYPES,
  normalizeListingType,
  type CommissionType,
  type EditListingData,
  type ListingType,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const COMMISSION_UNIT_OPTIONS = [
  { value: "chf", label: "CHF.-" },
  { value: "percent", label: "%" },
] as const;

const FORM_ID = "listing-form";

const FORM_CARD_CLASS =
  "section-light overflow-hidden rounded-md bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)] md:p-8";

const initialState = { success: false, message: "" };

export type FormMode = "sell" | "buy";

type ProfileDefaults = {
  email: string;
};

const TYPE_PLACEHOLDERS: Record<
  ListingType,
  { title: string; description: string; budgetOther: string }
> = {
  objet: {
    title: "Ex. Canapé scandinave 3 places",
    description: "État, dimensions, particularités…",
    budgetOther: "L'objet est offert",
  },
  service: {
    title: "Ex. Cours de piano à domicile",
    description: "Prestation, durée, zone d'intervention…",
    budgetOther: "Prestation offerte",
  },
};

const MODE_COPY = {
  sell: {
    priceLabel: "Commission",
    priceError: "Indiquez une commission valide.",
    submitPending: "Publication…",
    submitLabel: "Publier l'annonce",
    titlePlaceholderService: "Ex. Cours de piano à domicile",
    titlePlaceholderObjet: "Ex. Canapé scandinave 3 places",
    descPlaceholderService: "Prestation, durée, zone d'intervention…",
    descPlaceholderObjet: "État, dimensions, particularités…",
  },
  buy: {
    priceLabel: "Budget max (CHF)",
    budgetToggle: "Budget flexible",
    budgetToggleObjet: "Pas de budget maximum fixe",
    budgetToggleService: "Budget ouvert pour la prestation",
    priceError: "Indiquez un budget valide ou cochez « Budget flexible ».",
    submitPending: "Envoi…",
    submitLabel: "Envoyer",
    titlePlaceholderService: "Ex. Cours de piano à domicile",
    titlePlaceholderObjet: "Ex. Canapé scandinave 3 places",
    descPlaceholderService: "Type de prestation, fréquence, zone…",
    descPlaceholderObjet: "Critères, état souhaité, dimensions…",
  },
} as const;

function Toggle({
  id,
  name,
  label,
  description,
  checked,
  defaultChecked = false,
  onCheckedChange,
}: {
  id: string;
  name?: string;
  label: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex w-full cursor-pointer items-start justify-between gap-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3"
    >
      <span>
        <span className="block text-sm font-medium text-[var(--foreground)]">
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs text-[var(--muted)]">
            {description}
          </span>
        ) : null}
      </span>
      <input
        id={id}
        {...(name ? { name } : {})}
        type="checkbox"
        checked={checked}
        defaultChecked={checked === undefined ? defaultChecked : undefined}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        className="mt-1 h-4 w-4 border-[var(--border-strong)] accent-[var(--accent)]"
      />
    </label>
  );
}

function getFieldValue(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name);
  if (!field || !("value" in field) || typeof field.value !== "string") {
    return "";
  }
  return field.value.trim();
}

function resolveEditCategory(listing: EditListingData) {
  const categories = getCategoriesForType(listing.listing_type);
  if (listing.category === "Autre") {
    return { category: "Personnalisé", customCategory: "" };
  }
  if (categories.includes(listing.category)) {
    return { category: listing.category, customCategory: "" };
  }
  if (listing.category) {
    return { category: "Personnalisé", customCategory: listing.category };
  }
  return { category: "", customCategory: "" };
}

export function ListingForm({
  mode,
  profile,
  isAuthenticated,
  editListing,
}: {
  mode: FormMode;
  profile?: ProfileDefaults | null;
  isAuthenticated?: boolean;
  editListing?: EditListingData | null;
}) {
  const router = useRouter();
  const isEditing = Boolean(editListing);
  const copy = MODE_COPY[mode];
  const [sellState, sellAction, sellPending] = useActionState(
    isEditing ? updateProduct : submitProduct,
    initialState,
  );
  const [buyState, buyAction, buyPending] = useActionState(
    isEditing ? updateBuyRequest : submitBuyRequest,
    initialState,
  );
  const state = mode === "sell" ? sellState : buyState;
  const action = mode === "sell" ? sellAction : buyAction;
  const pending = mode === "sell" ? sellPending : buyPending;
  const formRef = useRef<HTMLFormElement>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authed, setAuthed] = useState(isAuthenticated ?? false);
  const [formError, setFormError] = useState("");
  const [listingType, setListingType] = useState<ListingType>("objet");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [commissionType, setCommissionType] = useState<"chf" | "percent">("chf");
  const [commissionValue, setCommissionValue] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [draftLoaded, setDraftLoaded] = useState(false);

  const canSubmit = authed || isAuthenticated;

  useEffect(() => {
    setAuthed(isAuthenticated ?? false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (profile?.email && !email) setEmail(profile.email);
  }, [profile, email]);

  useEffect(() => {
    if (!editListing) return;

    const resolved = resolveEditCategory(editListing);
    setListingType(normalizeListingType(editListing.listing_type));
    setCategory(resolved.category);
    setCustomCategory(resolved.customCategory);
    setIsFree(editListing.is_free ?? false);
    setCommissionType(
      editListing.commission_type === "percent" ? "percent" : "chf",
    );
    setCommissionValue(editListing.commission_value?.toString() ?? "");
    setPhotos(editListing.photos ?? []);
    setTitle(editListing.title);
    setDescription(editListing.description);
    setPrice(editListing.price?.toString() ?? "");
    setAddress(editListing.address === "En ligne" ? "" : editListing.address);
    setEmail(editListing.email ?? profile?.email ?? "");
    setDraftLoaded(true);
  }, [editListing, profile?.email]);

  useEffect(() => {
    if (editListing) return;
    const draft = loadFormDraft(mode);
    if (!draft) {
      setDraftLoaded(true);
      return;
    }

    setListingType(normalizeListingType(draft.listingType));
    setCategory(draft.category);
    setCustomCategory(draft.customCategory);
    setIsFree(draft.isFree);
    setCommissionType(draft.commissionType === "percent" ? "percent" : "chf");
    setCommissionValue(draft.commissionValue ?? draft.price ?? "");
    setPhotos(draft.photos);
    setTitle(draft.title);
    setDescription(draft.description);
    setPrice(draft.price);
    setAddress(draft.address);
    setEmail(draft.email || profile?.email || "");
    setDraftLoaded(true);
  }, [editListing, mode, profile?.email]);

  useEffect(() => {
    if (!draftLoaded || editListing) return;

    const draft: FormDraft = {
      listingType,
      category,
      customCategory,
      isFree,
      commissionType,
      commissionValue,
      photos,
      title,
      description,
      price,
      address,
      email,
    };

    saveFormDraft(mode, draft);
  }, [
    draftLoaded,
    mode,
    listingType,
    category,
    customCategory,
    isFree,
    commissionType,
    commissionValue,
    photos,
    title,
    description,
    price,
    address,
    email,
  ]);

  function persistDraft() {
    saveFormDraft(mode, {
      listingType,
      category,
      customCategory,
      isFree,
      commissionType,
      commissionValue,
      photos,
      title,
      description,
      price,
      address,
      email,
    });
  }

  function openAuthDialog() {
    persistDraft();
    setAuthDialogOpen(true);
  }

  function handleAuthSuccess() {
    setAuthed(true);
    setAuthDialogOpen(false);
    router.refresh();
  }

  useEffect(() => {
    if (isEditing && state.success) {
      router.push("/dashboard/annonces");
    }
  }, [isEditing, state.success, router]);

  useEffect(() => {
    if (mode === "sell" && !isEditing && state.success && state.listingId) {
      clearFormDraft(mode);
      router.push(`/vendre/plan?listing=${state.listingId}`);
    }
  }, [mode, isEditing, state.success, state.listingId, router]);

  async function handlePhotoUpload(files: FileList | null) {
    if (!files?.length) return;

    setUploading(true);
    setUploadError("");
    const supabase = createClient();
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const fileName = file.name || "upload.jpg";
      const ext = (fileName.split(".").pop() || "jpg").toLowerCase();
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from("product-photos")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) {
        setUploadError("Impossible d'envoyer une photo. Réessayez.");
        continue;
      }

      const { data } = supabase.storage
        .from("product-photos")
        .getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }

    setPhotos((current) => [...current, ...uploaded]);
    setUploading(false);
  }

  function removePhoto(index: number) {
    setPhotos((current) => current.filter((_, i) => i !== index));
  }

  function validateForm() {
    setFormError("");

    if (!resolvedCategory) {
      setFormError("Sélectionnez une catégorie.");
      return false;
    }

    if (!title || !description) {
      setFormError("Complétez tous les champs obligatoires.");
      return false;
    }

    if (title.length < 2) {
      setFormError("Le titre doit contenir au moins 2 caractères.");
      return false;
    }

    if (description.length < 10) {
      setFormError("La description doit contenir au moins 10 caractères.");
      return false;
    }

    if (mode === "sell") {
      const value = Number(commissionValue);
      if (!commissionValue || Number.isNaN(value) || value < 0) {
        setFormError(copy.priceError);
        return false;
      }
      if (commissionType === "percent" && value > 100) {
        setFormError("Le pourcentage ne peut pas dépasser 100 %.");
        return false;
      }
    } else if (!isFree && (!price || Number(price) < 0)) {
      setFormError(copy.priceError);
      return false;
    }

    return true;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!validateForm()) {
      event.preventDefault();
      return;
    }

    if (!canSubmit) {
      event.preventDefault();
      openAuthDialog();
      return;
    }
  }

  function handleListingTypeChange(type: ListingType) {
    setListingType(type);
    setCategory("");
    setCustomCategory("");
  }

  function handleCategorySelect(value: string) {
    setCategory(value);
    if (value !== "Personnalisé") {
      setCustomCategory("");
    }
  }

  const categories = getCategoriesForType(listingType);
  const placeholders = TYPE_PLACEHOLDERS[listingType] ?? TYPE_PLACEHOLDERS.objet;
  const physicalListing = isPhysicalListingType(listingType);
  const resolvedCategory =
    category === "Personnalisé" ? customCategory.trim() : category;
  const showDetailsSection = Boolean(resolvedCategory);
  const externalSubmit = mode === "sell" && !isEditing;

  const submitLabel = pending
    ? isEditing
      ? "Enregistrement…"
      : copy.submitPending
    : isEditing
      ? "Enregistrer les modifications"
      : copy.submitLabel;

  const form = (
    <form
      id={externalSubmit ? FORM_ID : undefined}
      ref={formRef}
      action={action}
      onSubmit={handleSubmit}
      className="space-y-3"
    >
        <input type="hidden" name="photos" value={JSON.stringify(photos)} />
        <input type="hidden" name="listing_type" value={listingType} />
        {editListing ? (
          <input type="hidden" name="listing_id" value={editListing.id} />
        ) : null}
        <input type="hidden" name="category" value={category} />
        <input
          type="hidden"
          name="custom_category"
          value={category === "Personnalisé" ? customCategory : ""}
        />
        {mode === "buy" && isFree ? (
          <input type="hidden" name="is_free" value="on" />
        ) : null}
        {mode === "sell" ? (
          <>
            <input type="hidden" name="commission_type" value={commissionType} />
            <input type="hidden" name="commission_value" value={commissionValue} />
          </>
        ) : null}
        <input type="hidden" name="email" value={email} />

      <div className="space-y-5">
          <div>
            <label className="field-label">Type</label>
            <div className="catalog-filter-grid mt-2">
              {LISTING_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`catalog-filter-pill catalog-filter-pill-lg ${
                    listingType === type.value ? "catalog-filter-pill-active" : ""
                  }`}
                  onClick={() => handleListingTypeChange(type.value)}
                  aria-pressed={listingType === type.value}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">Catégorie</label>
            <div className="category-grid mt-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`catalog-filter-pill catalog-filter-pill-lg ${
                    category === item ? "catalog-filter-pill-active" : ""
                  }`}
                  onClick={() => handleCategorySelect(item)}
                  aria-pressed={category === item}
                >
                  {item}
                </button>
              ))}
            </div>
            {category === "Personnalisé" ? (
              <input
                id="custom_category_display"
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value)}
                placeholder="Votre catégorie"
                className="field-input mt-3"
              />
            ) : null}
          </div>

          <div className="border border-dashed border-[var(--border-strong)] bg-[var(--background)] p-6">
            <label htmlFor="photos" className="field-label">
              Photos
            </label>
            <input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              className="mt-3 block w-full text-sm text-[var(--muted)] file:mr-4 file:rounded-md file:border file:border-[var(--border)] file:bg-[var(--surface)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--foreground)] hover:file:bg-[var(--surface-hover)]"
              onChange={(event) => handlePhotoUpload(event.target.files)}
              disabled={uploading || pending}
            />
            {uploading ? (
              <p className="mt-2 text-xs text-[var(--muted)]">Envoi en cours…</p>
            ) : null}
            {uploadError ? (
              <p className="mt-2 text-xs text-[var(--error)]">{uploadError}</p>
            ) : null}

            {photos.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {photos.filter(Boolean).map((photo, index) => (
                  <div
                    key={`${photo}-${index}`}
                    className="relative aspect-square overflow-hidden border border-[var(--border)]"
                  >
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute right-2 top-2 border border-[var(--border)] bg-[var(--background)]/90 px-2 py-0.5 text-[10px] font-medium"
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
      </div>

      {showDetailsSection ? (
        <div className="flex flex-col gap-5 border-t border-[var(--border)] pt-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="field-label">
              Titre
            </label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={placeholders.title}
              className="field-input"
              minLength={2}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="field-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={placeholders.description}
              className="field-input min-h-28 resize-y"
              minLength={10}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="address" className="field-label">
              Lieu
            </label>
            <input
              id="address"
              name="address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Rue du Rhône 12, Genève"
              className="field-input"
            />
          </div>

          {mode === "sell" ? (
            <div>
              <label className="field-label">{copy.priceLabel}</label>
              <div className="catalog-filter-grid mt-2">
                {COMMISSION_UNIT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`catalog-filter-pill catalog-filter-pill-lg ${
                      commissionType === option.value ? "catalog-filter-pill-active" : ""
                    }`}
                    onClick={() => setCommissionType(option.value)}
                    aria-pressed={commissionType === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <label htmlFor="commission_value" className="field-label">
                  {commissionType === "percent"
                    ? "Pourcentage"
                    : "Montant (CHF)"}
                </label>
                <input
                  id="commission_value"
                  type="number"
                  min="0"
                  max={commissionType === "percent" ? "100" : undefined}
                  step={commissionType === "percent" ? "0.5" : "1"}
                  value={commissionValue}
                  onChange={(event) => setCommissionValue(event.target.value)}
                  placeholder={commissionType === "percent" ? "10" : "120"}
                  className="field-input mt-2"
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="price" className="field-label">
                  {copy.priceLabel}
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  disabled={isFree}
                  placeholder="120"
                  className="field-input mt-2 disabled:opacity-40"
                />
              </div>
              <div className="flex items-end">
                <Toggle
                  id="is_free"
                  label={MODE_COPY.buy.budgetToggle}
                  description={
                    physicalListing
                      ? MODE_COPY.buy.budgetToggleObjet
                      : placeholders.budgetOther
                  }
                  checked={isFree}
                  onCheckedChange={setIsFree}
                />
              </div>
            </div>
          )}

          {formError ? (
            <p className="text-sm text-[var(--error)]" role="alert">
              {formError}
            </p>
          ) : null}

          {state.message ? (
            <p
              className={`text-sm ${
                state.success ? "text-[var(--success)]" : "text-[var(--error)]"
              }`}
              role="status"
            >
              {state.message}
            </p>
          ) : null}

          {!externalSubmit ? (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="btn-form btn-primary"
                disabled={pending}
              >
                {submitLabel}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );

  return (
    <>
      {externalSubmit ? (
        <div className={FORM_CARD_CLASS}>{form}</div>
      ) : (
        form
      )}

      {externalSubmit && showDetailsSection ? (
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            form={FORM_ID}
            className="btn-vendre-submit btn-vendre-submit-lg"
            disabled={pending}
          >
            {submitLabel}
          </button>
        </div>
      ) : null}

      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        onSuccess={handleAuthSuccess}
        returnPath="/vendre"
      />
    </>
  );
}
