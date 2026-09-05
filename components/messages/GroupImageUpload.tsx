"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GroupAvatar } from "@/components/messages/GroupAvatar";

type GroupImageUploadProps = {
  userId: string;
  title?: string;
};

export function GroupImageUpload({ userId, title = "" }: GroupImageUploadProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choisissez une image (JPEG, PNG, WebP ou GIF).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 2 Mo.");
      return;
    }

    setUploading(true);
    setError("");

    const supabase = createClient();
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("group-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setUploading(false);
      setError("Impossible d'envoyer l'image. Réessayez.");
      return;
    }

    const { data } = supabase.storage.from("group-images").getPublicUrl(path);
    setImageUrl(`${data.publicUrl}?t=${Date.now()}`);
    setUploading(false);
  }

  function handleRemove() {
    setImageUrl("");
    setError("");
  }

  return (
    <div className="form-stripe-field settings-logo-field">
      <span className="field-label">Image du groupe</span>
      <div className="settings-logo-upload">
        <GroupAvatar title={title} imageUrl={imageUrl} size="lg" />
        <div className="settings-logo-upload-actions">
          <label className="settings-logo-upload-btn">
            {uploading ? "Envoi…" : imageUrl ? "Changer l'image" : "Ajouter une image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              disabled={uploading}
              onChange={handleFileChange}
            />
          </label>
          {imageUrl ? (
            <button
              type="button"
              className="settings-logo-upload-remove"
              onClick={handleRemove}
              disabled={uploading}
            >
              Supprimer
            </button>
          ) : null}
        </div>
      </div>
      <input type="hidden" name="image_url" value={imageUrl.split("?")[0] ?? ""} />
      {error ? (
        <p className="text-sm text-[var(--error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
