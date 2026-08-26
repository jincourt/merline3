import type { FormMode } from "@/components/listings/ListingForm";
import type { CommissionType, ListingType } from "@/lib/types";

export type FormDraft = {
  listingType: ListingType;
  category: string;
  customCategory: string;
  isFree: boolean;
  commissionType: CommissionType;
  commissionValue: string;
  photos: string[];
  title: string;
  description: string;
  price: string;
  address: string;
  email: string;
};

function storageKey(mode: FormMode) {
  return `merline-form-${mode}`;
}

export function loadFormDraft(mode: FormMode): FormDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(storageKey(mode));
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<FormDraft>;
    return {
      listingType: draft.listingType ?? "objet",
      category: draft.category ?? "",
      customCategory: draft.customCategory ?? "",
      isFree: draft.isFree ?? false,
      commissionType: draft.commissionType === "percent" ? "percent" : "chf",
      commissionValue: draft.commissionValue ?? draft.price ?? "",
      photos: draft.photos ?? [],
      title: draft.title ?? "",
      description: draft.description ?? "",
      price: draft.price ?? "",
      address: draft.address ?? "",
      email: draft.email ?? "",
    };
  } catch {
    return null;
  }
}

export function saveFormDraft(mode: FormMode, draft: FormDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(storageKey(mode), JSON.stringify(draft));
}

export function clearFormDraft(mode: FormMode) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(storageKey(mode));
}
