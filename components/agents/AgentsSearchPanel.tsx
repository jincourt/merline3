"use client";

import { useMemo, useState } from "react";
import { filterAgents, type PublicProfile } from "@/lib/agent-profiles";
import { AgentDirectoryGrid } from "./AgentDirectoryGrid";

type AgentsSearchPanelProps = {
  agents: PublicProfile[];
};

export function AgentsSearchPanel({ agents }: AgentsSearchPanelProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => filterAgents(agents, query), [agents, query]);

  const emptyMessage =
    agents.length === 0
      ? "Aucun agent inscrit pour le moment. Soyez parmi les premiers à rejoindre le réseau."
      : "Aucun agent ne correspond à votre recherche.";

  return (
    <div className="agents-page-panel">
      <div className="catalog-search">
        <label htmlFor="agents-search" className="section-title">
          Rechercher un agent
        </label>
        <input
          id="agents-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nom, nom d'utilisateur, NPA ou canton…"
          className="field-input mt-4"
          autoComplete="off"
        />
      </div>

      {query.trim() ? (
        <p className="agents-search-count" role="status">
          {filtered.length} agent{filtered.length > 1 ? "s" : ""} trouvé
          {filtered.length > 1 ? "s" : ""}
        </p>
      ) : null}

      <AgentDirectoryGrid
        agents={filtered}
        emptyMessage={emptyMessage}
        className="agents-page-grid"
        animate={false}
      />
    </div>
  );
}
