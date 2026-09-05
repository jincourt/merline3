"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  filterAgents,
  getAgentDisplayName,
  type PublicProfile,
} from "@/lib/agent-profiles";
import { ProfileAvatar } from "@/components/profiles/ProfileAvatar";

type GroupMemberPickerProps = {
  profiles: PublicProfile[];
  currentUserId: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export function GroupMemberPicker({
  profiles,
  currentUserId,
  selectedIds,
  onChange,
}: GroupMemberPickerProps) {
  const [query, setQuery] = useState("");

  const availableProfiles = useMemo(
    () => profiles.filter((profile) => profile.id !== currentUserId),
    [profiles, currentUserId],
  );

  const filtered = useMemo(
    () => filterAgents(availableProfiles, query),
    [availableProfiles, query],
  );

  const selectedProfiles = useMemo(
    () =>
      selectedIds
        .map((id) => availableProfiles.find((profile) => profile.id === id))
        .filter((profile): profile is PublicProfile => Boolean(profile)),
    [availableProfiles, selectedIds],
  );

  function toggleMember(profileId: string) {
    if (selectedIds.includes(profileId)) {
      onChange(selectedIds.filter((id) => id !== profileId));
      return;
    }
    onChange([...selectedIds, profileId]);
  }

  function removeMember(profileId: string) {
    onChange(selectedIds.filter((id) => id !== profileId));
  }

  return (
    <div className="group-member-picker">
      {selectedProfiles.length > 0 ? (
        <ul className="group-member-chips" aria-label="Membres sélectionnés">
          {selectedProfiles.map((profile) => (
            <li key={profile.id}>
              <span className="group-member-chip">
                <ProfileAvatar
                  name={profile.name}
                  username={profile.username}
                  avatarUrl={profile.avatarUrl}
                  size="sm"
                />
                <span className="group-member-chip-label">
                  {getAgentDisplayName(profile)}
                </span>
                <button
                  type="button"
                  className="group-member-chip-remove"
                  aria-label={`Retirer ${getAgentDisplayName(profile)}`}
                  onClick={() => removeMember(profile.id)}
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="group-member-search">
        <label htmlFor="group-member-search" className="field-label">
          Ajouter des membres
        </label>
        <input
          id="group-member-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nom, nom d'utilisateur, NPA ou canton…"
          className="field-input catalog-search-input mt-2"
          autoComplete="off"
        />
      </div>

      {query.trim() ? (
        <p className="group-member-search-count" role="status">
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </p>
      ) : null}

      <ul className="group-member-results">
        {filtered.length === 0 ? (
          <li className="group-member-empty">
            {availableProfiles.length === 0
              ? "Aucun utilisateur disponible."
              : "Aucun utilisateur ne correspond à votre recherche."}
          </li>
        ) : (
          filtered.map((profile) => {
            const selected = selectedIds.includes(profile.id);
            const displayName = getAgentDisplayName(profile);
            const location = [profile.npa, profile.canton].filter(Boolean).join(" ");

            return (
              <li key={profile.id}>
                <button
                  type="button"
                  className={`group-member-option ${selected ? "group-member-option-selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => toggleMember(profile.id)}
                >
                  <ProfileAvatar
                    name={profile.name}
                    username={profile.username}
                    avatarUrl={profile.avatarUrl}
                    size="sm"
                  />
                  <span className="group-member-option-body">
                    <span className="group-member-option-name">{displayName}</span>
                    <span className="group-member-option-meta">
                      @{profile.username}
                      {location ? ` · ${location}` : ""}
                    </span>
                  </span>
                  <span className="group-member-option-check" aria-hidden>
                    {selected ? "✓" : "+"}
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
