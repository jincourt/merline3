"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { ProfileAvatar } from "@/components/profiles/ProfileAvatar";
import { GroupAvatar } from "@/components/messages/GroupAvatar";

export type MessageConversation = {
  kind: "direct";
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

export type MessageGroup = {
  kind: "group";
  id: string;
  title: string;
  imageUrl: string;
  memberCount: number;
  lastBody: string;
  lastAt: string;
  unread: number;
};

export type MessageThread = MessageConversation | MessageGroup;

function filterThreads(threads: MessageThread[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return threads;

  return threads.filter((thread) => {
    if (thread.kind === "direct") {
      return (
        thread.otherName.toLowerCase().includes(normalizedQuery) ||
        thread.title.toLowerCase().includes(normalizedQuery) ||
        thread.lastBody.toLowerCase().includes(normalizedQuery)
      );
    }

    return (
      thread.title.toLowerCase().includes(normalizedQuery) ||
      thread.lastBody.toLowerCase().includes(normalizedQuery)
    );
  });
}

function formatThreadTime(value: string) {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function MessagesRow({
  href,
  unread,
  lastAt,
  avatar,
  name,
  details,
}: {
  href: string;
  unread: number;
  lastAt: string;
  avatar: ReactNode;
  name: string;
  details: string[];
}) {
  return (
    <li className="messages-item">
      <Link
        href={href}
        className={`messages-row ${unread > 0 ? "messages-row-unread" : ""}`}
      >
        {avatar}

        <div className="messages-row-body">
          <div className="messages-row-top">
            <div className="min-w-0">
              <p className="messages-row-name">{name}</p>
              {details.map((detail, index) => (
                <p key={`${index}-${detail}`} className="messages-row-detail">
                  {detail}
                </p>
              ))}
            </div>
            <div className="messages-row-meta">
              {unread > 0 ? <span className="messages-row-dot" aria-hidden /> : null}
              <time className="messages-row-time">{formatThreadTime(lastAt)}</time>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}

function getGroupDetails(thread: MessageGroup) {
  const details = [
    `${thread.memberCount} membre${thread.memberCount > 1 ? "s" : ""}`,
  ];

  if (thread.lastBody.trim()) {
    details.push(thread.lastBody.trim());
  }

  return details;
}

function getDirectDetails(thread: MessageConversation) {
  const details: string[] = [];

  if (thread.title.trim()) {
    details.push(thread.title.trim());
  }

  if (thread.lastBody.trim()) {
    details.push(thread.lastBody.trim());
  }

  return details;
}

export function MessagesListPanel({
  threads,
}: {
  threads: MessageThread[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => filterThreads(threads, query),
    [threads, query],
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
          placeholder="Nom, groupe, message…"
          className="field-input catalog-search-input"
        />
      </div>

      {!threads.length ? (
        <div className="messages-empty mt-8">
          <p className="messages-empty-title">Aucune conversation</p>
          <p className="messages-empty-desc">
            Contactez un agent ou un annonceur depuis une annonce, ou créez un
            groupe pour discuter à plusieurs.
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
            {filtered.map((thread) =>
              thread.kind === "group" ? (
                <MessagesRow
                  key={`group-${thread.id}`}
                  href={`/dashboard/messages/groupes/${thread.id}`}
                  unread={thread.unread}
                  lastAt={thread.lastAt}
                  name={thread.title}
                  details={getGroupDetails(thread)}
                  avatar={
                    <GroupAvatar
                      title={thread.title}
                      imageUrl={thread.imageUrl}
                      size="sm"
                    />
                  }
                />
              ) : (
                <MessagesRow
                  key={`direct-${thread.id}`}
                  href={`/dashboard/messages/${thread.id}`}
                  unread={thread.unread}
                  lastAt={thread.lastAt}
                  name={thread.otherName}
                  details={getDirectDetails(thread)}
                  avatar={
                    <ProfileAvatar
                      name={thread.otherProfileName}
                      username={thread.otherUsername}
                      avatarUrl={thread.otherAvatarUrl}
                      size="sm"
                    />
                  }
                />
              ),
            )}
          </ul>
        </div>
      )}
    </>
  );
}
