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
  variant = "default",
  redirectAfterDelete = true,
}: {
  listingId: string;
  intent: "sell" | "buy";
  title: string;
  variant?: "default" | "icon";
  redirectAfterDelete?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isIcon = variant === "icon";

  function handleDeleteConfirm() {
    startTransition(async () => {
      const result = await deleteListing(listingId, intent);
      if (result.success) {
        setDeleteDialogOpen(false);
        if (redirectAfterDelete) {
          router.push("/dashboard/annonces");
        }
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
        className={
          isIcon
            ? "dashboard-listing-row-delete-btn"
            : "dashboard-listing-delete-btn"
        }
        aria-label={isIcon ? "Supprimer l'annonce" : undefined}
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        {!isIcon ? "Supprimer l'annonce" : null}
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
