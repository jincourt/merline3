"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProfileAvatar } from "@/components/profiles/ProfileAvatar";

type ProfileLogoUploadProps = {
  userId: string;
  displayName: string;
  username: string;
  initialUrl?: string;
};

export function ProfileLogoUpload({
  userId,
  displayName,
  username,
  initialUrl = "",
}: ProfileLogoUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState(initialUrl);
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
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-avatars")
      .upload(path, file, { cacheControl: "3600", upsert: true });

    if (uploadError) {
      setUploading(false);
      setError("Impossible d'envoyer l'image. Réessayez.");
      return;
    }

    const { data } = supabase.storage.from("profile-avatars").getPublicUrl(path);
    setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    setUploading(false);
  }

  function handleRemove() {
    setAvatarUrl("");
    setError("");
  }

  return (
    <div className="form-stripe-field settings-logo-field">
      <span className="field-label">Photo de profil</span>
      <div className="settings-logo-upload">
        <ProfileAvatar
          name={displayName}
          username={username}
          avatarUrl={avatarUrl}
          size="lg"
        />
        <div className="settings-logo-upload-actions">
          <label className="settings-logo-upload-btn">
            {uploading ? "Envoi…" : avatarUrl ? "Changer la photo" : "Ajouter une photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              disabled={uploading}
              onChange={handleFileChange}
            />
          </label>
          {avatarUrl ? (
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
      <input type="hidden" name="avatar_url" value={avatarUrl.split("?")[0] ?? ""} />
      {error ? (
        <p className="text-sm text-[var(--error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
