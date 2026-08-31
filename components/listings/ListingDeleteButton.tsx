"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteListing } from "@/app/auth/actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function ListingDeleteButton({
  listingId,
  intent,
  title,
}: {
  listingId: string;
  intent: "sell" | "buy";
  title: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  function handleDeleteConfirm() {
    startTransition(async () => {
      const result = await deleteListing(listingId, intent);
      if (result.success) {
        setDeleteDialogOpen(false);
        router.push("/dashboard/annonces");
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDeleteDialogOpen(true)}
        disabled={pending}
        className="dashboard-listing-delete-btn"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        Supprimer l&apos;annonce
      </button>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer cette annonce ?"
        description={`« ${title} » sera définitivement supprimée. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        pending={pending}
        pendingLabel="Suppression…"
        destructive
      />
    </>
  );
}
