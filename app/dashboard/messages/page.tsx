import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { PageMotion } from "@/components/layout/PageMotion";
import { ProfileAvatar } from "@/components/profiles/ProfileAvatar";
import { getAgentDisplayName } from "@/lib/agent-profiles";
import { getListingHref, sourceToIntent, type ConvSource } from "@/lib/types";
import { getProfileHref } from "@/lib/profile-reviews";

type ConversationRow = {
  id: string;
  listing_id: string;
  src: ConvSource;
  owner_id: string;
  peer_id: string;
  updated_at: string;
};

async function getConversationTitle(
  supabase: Awaited<ReturnType<typeof createClient>>,
  conv: ConversationRow,
) {
  if (conv.src === "profile") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, username")
      .eq("id", conv.owner_id)
      .maybeSingle();

    if (!profile) return "Profil";

    return `Profil · ${getAgentDisplayName({
      name: profile.name?.trim() ?? "",
      username: profile.username?.trim() ?? "",
    })}`;
  }

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
        getConversationTitle(supabase, conv),
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
        .select("username, name, avatar_url")
        .eq("id", otherUserId)
        .maybeSingle();

      const otherName = profile
        ? getAgentDisplayName({
            name: profile.name?.trim() ?? "",
            username: profile.username?.trim() ?? "",
          })
        : "Utilisateur";

      return {
        id: conv.id,
        title,
        href:
          conv.src === "profile" && profile?.username
            ? getProfileHref(profile.username.trim())
            : getListingHref(conv.listing_id, sourceToIntent(conv.src)),
        otherName,
        otherProfileName: profile?.name?.trim() ?? "",
        otherUsername: profile?.username?.trim() ?? "",
        otherAvatarUrl: profile?.avatar_url?.trim() ?? "",
        lastBody: lastMsgResult.data?.body ?? "",
        lastAt: lastMsgResult.data?.created_at ?? conv.updated_at,
        unread: unreadResult.count ?? 0,
      };
    }),
  );

  return (
    <PageMotion className="dashboard-page">
      <h1 className="dashboard-page-title">Messages</h1>
     

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
                <div className="dashboard-message-row">
                  <ProfileAvatar
                    name={conv.otherProfileName}
                    username={conv.otherUsername}
                    avatarUrl={conv.otherAvatarUrl}
                    size="sm"
                    className={
                      conv.unread > 0 ? "dashboard-message-avatar-unread" : ""
                    }
                  />
                  <div className="dashboard-message-content">
                    <div className="dashboard-message-top">
                      <div className="min-w-0">
                        <p className="dashboard-message-title">{conv.title}</p>
                        <p className="dashboard-message-peer">{conv.otherName}</p>
                      </div>
                      <time className="dashboard-message-time">
                        {new Intl.DateTimeFormat("fr-CH", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(conv.lastAt))}
                      </time>
                    </div>
                    <p className="dashboard-message-preview">{conv.lastBody}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageMotion>
  );
}
