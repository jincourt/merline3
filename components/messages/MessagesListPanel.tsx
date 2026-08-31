"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProfileAvatar } from "@/components/profiles/ProfileAvatar";

export type MessageConversation = {
  id: string;
  title: string;
  otherName: string;
  otherProfileName: string;
  otherUsername: string;
  otherAvatarUrl: string;
  lastBody: string;
  lastAt: string;
  unread: number;
};

function filterConversations(conversations: MessageConversation[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return conversations;

  return conversations.filter((conv) => {
    return (
      conv.otherName.toLowerCase().includes(normalizedQuery) ||
      conv.title.toLowerCase().includes(normalizedQuery) ||
      conv.lastBody.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function MessagesListPanel({
  conversations,
}: {
  conversations: MessageConversation[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => filterConversations(conversations, query),
    [conversations, query],
  );

  return (
    <>
      <div className="messages-search mt-8">
        <label htmlFor="messages-search" className="sr-only">
          Rechercher une conversation
        </label>
        <input
          id="messages-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nom, message…"
          className="field-input catalog-search-input"
        />
      </div>

      {!conversations.length ? (
        <div className="messages-empty mt-8">
          <p className="messages-empty-title">Aucune conversation</p>
          <p className="messages-empty-desc">
            Contactez un agent ou un annonceur depuis une annonce pour démarrer
            une discussion.
          </p>
        </div>
      ) : !filtered.length ? (
        <div className="messages-empty mt-8">
          <p className="messages-empty-title">Aucun résultat</p>
          <p className="messages-empty-desc">
            Aucune conversation ne correspond à votre recherche.
          </p>
        </div>
      ) : (
        <div className="messages-panel mt-8">
          <ul className="messages-list">
            {filtered.map((conv) => (
              <li key={conv.id} className="messages-item">
                <Link
                  href={`/dashboard/messages/${conv.id}`}
                  className={`messages-row ${
                    conv.unread > 0 ? "messages-row-unread" : ""
                  }`}
                >
                  <ProfileAvatar
                    name={conv.otherProfileName}
                    username={conv.otherUsername}
                    avatarUrl={conv.otherAvatarUrl}
                    size="sm"
                  />

                  <div className="messages-row-body">
                    <div className="messages-row-top">
                      <div className="min-w-0">
                        <p className="messages-row-name">{conv.otherName}</p>
                      </div>
                      <div className="messages-row-meta">
                        {conv.unread > 0 ? (
                          <span className="messages-row-dot" aria-hidden />
                        ) : null}
                        <time className="messages-row-time">
                          {new Intl.DateTimeFormat("fr-CH", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(conv.lastAt))}
                        </time>
                      </div>
                    </div>
                    {conv.lastBody ? (
                      <p className="messages-row-preview">{conv.lastBody}</p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
