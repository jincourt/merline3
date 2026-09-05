"use client";

import { useActionState, useState } from "react";
import { createMessageGroup, type GroupActionResult } from "@/app/actions";
import type { PublicProfile } from "@/lib/agent-profiles";
import { GroupMemberPicker } from "./GroupMemberPicker";
import { GroupImageUpload } from "./GroupImageUpload";

const initialState: GroupActionResult = {
  success: false,
  message: "",
};

type GroupFormProps = {
  profiles: PublicProfile[];
  currentUserId: string;
};

export function GroupForm({ profiles, currentUserId }: GroupFormProps) {
  const [state, action, pending] = useActionState(createMessageGroup, initialState);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");

  return (
    <form action={action} className="form-stripe">
      <div className="form-stripe-section">
        <p className="form-stripe-section-title">Groupe</p>

        <GroupImageUpload userId={currentUserId} title={title} />

        <div className="form-stripe-field">
          <label htmlFor="group-title" className="field-label">
            Titre
          </label>
          <input
            id="group-title"
            name="title"
            type="text"
            required
            minLength={1}
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex. Équipe vente Genève"
            className="field-input"
            autoComplete="off"
          />
        </div>

        <div className="form-stripe-field">
          <label htmlFor="group-description" className="field-label">
            Description
          </label>
          <textarea
            id="group-description"
            name="description"
            rows={4}
            maxLength={500}
            placeholder="Décrivez l'objectif du groupe…"
            className="field-input min-h-28 resize-y"
          />
        </div>
      </div>

      <div className="form-stripe-section">
        <p className="form-stripe-section-title">Membres</p>
        <GroupMemberPicker
          profiles={profiles}
          currentUserId={currentUserId}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
        />
        <input
          type="hidden"
          name="member_ids"
          value={JSON.stringify(selectedIds)}
          readOnly
        />
      </div>

      {state.message && !state.success ? (
        <p className="text-sm text-[var(--error)]" role="alert">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn-primary form-stripe-submit"
        disabled={pending || selectedIds.length < 1}
      >
        {pending ? "Création…" : "Créer le groupe"}
      </button>
    </form>
  );
}
