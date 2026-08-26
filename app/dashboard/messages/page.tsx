import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { PageMotion } from "@/components/layout/PageMotion";
import { getListingHref, sourceToIntent } from "@/lib/types";

type ConversationRow = {
  id: string;
  listing_id: string;
  src: "prod" | "buy";
  owner_id: string;
  peer_id: string;
  updated_at: string;
};

async function getListingTitle(
  supabase: Awaited<ReturnType<typeof createClient>>,
  conv: ConversationRow,
) {
  const table = conv.src === "prod" ? "products" : "buy_requests";
  const { data } = await supabase
    .from(table)
    .select("title")
    .eq("id", conv.listing_id)
    .maybeSingle();

  return data?.title ?? "Annonce";
}

export default async function MessagesPage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: convs } = await supabase
    .from("convs")
    .select("id, listing_id, src, owner_id, peer_id, updated_at")
    .or(`owner_id.eq.${user.id},peer_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  const conversations = convs ?? [];

  const enriched = await Promise.all(
    conversations.map(async (conv) => {
      const [title, lastMsgResult, unreadResult] = await Promise.all([
        getListingTitle(supabase, conv),
        supabase
          .from("conv_msgs")
          .select("body, created_at, sender_id")
          .eq("conv_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("conv_msgs")
          .select("id", { count: "exact", head: true })
          .eq("conv_id", conv.id)
          .neq("sender_id", user.id)
          .is("read_at", null),
      ]);

      const otherUserId = conv.owner_id === user.id ? conv.peer_id : conv.owner_id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", otherUserId)
        .maybeSingle();

      return {
        id: conv.id,
        title,
        href: getListingHref(conv.listing_id, sourceToIntent(conv.src)),
        otherName: profile?.full_name?.trim() || "Utilisateur",
        lastBody: lastMsgResult.data?.body ?? "",
        lastAt: lastMsgResult.data?.created_at ?? conv.updated_at,
        unread: unreadResult.count ?? 0,
      };
    }),
  );

  return (
    <PageMotion className="dashboard-page">
      <h1 className="dashboard-page-title">Messages</h1>
      <p className="dashboard-page-desc">Vos conversations liées aux annonces.</p>

      {!enriched.length ? (
        <div className="dashboard-empty">
          <p className="text-sm text-[var(--muted)]">Aucune conversation pour le moment.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {enriched.map((conv) => (
            <li key={conv.id}>
              <Link
                href={`/dashboard/messages/${conv.id}`}
                className={`dashboard-message ${
                  conv.unread > 0 ? "dashboard-message-unread" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="dashboard-message-dot mt-1.5" aria-hidden />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">
                        {conv.title}
                      </p>
                      <p className="text-xs text-[var(--muted)]">{conv.otherName}</p>
                    </div>
                  </div>
                  <time className="shrink-0 text-xs text-[var(--muted-dim)]">
                    {new Intl.DateTimeFormat("fr-CH", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(conv.lastAt))}
                  </time>
                </div>
                <p className="mt-2 line-clamp-2 pl-[1.125rem] text-sm text-[var(--muted)]">
                  {conv.lastBody}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageMotion>
  );
}
