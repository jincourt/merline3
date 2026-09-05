import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { Footer } from "@/components/layout/Footer";
import { PageMotion } from "@/components/layout/PageMotion";
import { HeaderIcon, PlusIcon } from "@/components/layout/HeaderIcons";
import {
  MessagesListPanel,
  type MessageConversation,
  type MessageGroup,
  type MessageThread,
} from "@/components/messages/MessagesListPanel";
import { getAgentDisplayName } from "@/lib/agent-profiles";
import type { ConvSource } from "@/lib/types";

type ConversationRow = {
  id: string;
  listing_id: string;
  src: ConvSource;
  owner_id: string;
  peer_id: string;
  updated_at: string;
};

type GroupRow = {
  id: string;
  title: string;
  image_url: string | null;
  updated_at: string;
};

async function getListingTitles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  conversations: ConversationRow[],
) {
  const prodIds = conversations
    .filter((conv) => conv.src === "prod")
    .map((conv) => conv.listing_id);
  const buyIds = conversations
    .filter((conv) => conv.src === "buy")
    .map((conv) => conv.listing_id);

  const [productsResult, buyRequestsResult] = await Promise.all([
    prodIds.length
      ? supabase.from("products").select("id, title").in("id", prodIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    buyIds.length
      ? supabase.from("buy_requests").select("id, title").in("id", buyIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);

  const titles = new Map<string, string>();

  for (const product of productsResult.data ?? []) {
    titles.set(`prod:${product.id}`, product.title?.trim() ?? "");
  }

  for (const buyRequest of buyRequestsResult.data ?? []) {
    titles.set(`buy:${buyRequest.id}`, buyRequest.title?.trim() ?? "");
  }

  return titles;
}

async function getProfileTitles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  conversations: ConversationRow[],
) {
  const ownerIds = [
    ...new Set(
      conversations
        .filter((conv) => conv.src === "profile")
        .map((conv) => conv.owner_id),
    ),
  ];

  if (!ownerIds.length) return new Map<string, string>();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, username")
    .in("id", ownerIds);

  const titles = new Map<string, string>();

  for (const profile of profiles ?? []) {
    titles.set(
      profile.id,
      getAgentDisplayName({
        name: profile.name?.trim() ?? "",
        username: profile.username?.trim() ?? "",
      }),
    );
  }

  return titles;
}

function getConversationTitle(
  conv: ConversationRow,
  listingTitles: Map<string, string>,
  profileTitles: Map<string, string>,
) {
  if (conv.src === "profile") {
    const profileName = profileTitles.get(conv.owner_id);
    return profileName ? `Profil · ${profileName}` : "Profil";
  }

  return listingTitles.get(`${conv.src}:${conv.listing_id}`) ?? "";
}

async function getUserGroups(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data: memberships } = await supabase
    .from("msg_group_members")
    .select("group_id, last_read_at")
    .eq("user_id", userId);

  const groupIds = (memberships ?? []).map((membership) => membership.group_id);
  if (!groupIds.length) return [] as MessageGroup[];

  const readMap = new Map(
    (memberships ?? []).map((membership) => [
      membership.group_id,
      membership.last_read_at,
    ]),
  );

  const [{ data: groups }, { data: memberCounts }] = await Promise.all([
    supabase
      .from("msg_groups")
      .select("id, title, image_url, updated_at")
      .in("id", groupIds),
    supabase.from("msg_group_members").select("group_id").in("group_id", groupIds),
  ]);

  const countMap = new Map<string, number>();
  for (const row of memberCounts ?? []) {
    countMap.set(row.group_id, (countMap.get(row.group_id) ?? 0) + 1);
  }

  const enriched = await Promise.all(
    (groups ?? []).map(async (group: GroupRow) => {
      const [lastMsgResult, unreadResult] = await Promise.all([
        supabase
          .from("msg_group_msgs")
          .select("body, created_at, sender_id")
          .eq("group_id", group.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        (async () => {
          const lastReadAt = readMap.get(group.id);
          let query = supabase
            .from("msg_group_msgs")
            .select("id", { count: "exact", head: true })
            .eq("group_id", group.id)
            .neq("sender_id", userId);

          if (lastReadAt) {
            query = query.gt("created_at", lastReadAt);
          }

          return query;
        })(),
      ]);

      return {
        kind: "group" as const,
        id: group.id,
        title: group.title?.trim() ?? "Groupe",
        imageUrl: group.image_url?.trim() ?? "",
        memberCount: countMap.get(group.id) ?? 0,
        lastBody: lastMsgResult.data?.body ?? "",
        lastAt: lastMsgResult.data?.created_at ?? group.updated_at,
        unread: unreadResult.count ?? 0,
      };
    }),
  );

  return enriched;
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

  const [listingTitles, profileTitles, groups] = await Promise.all([
    getListingTitles(supabase, conversations),
    getProfileTitles(supabase, conversations),
    getUserGroups(supabase, user.id),
  ]);

  const directThreads: MessageConversation[] = await Promise.all(
    conversations.map(async (conv) => {
      const title = getConversationTitle(conv, listingTitles, profileTitles);
      const [lastMsgResult, unreadResult] = await Promise.all([
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
        kind: "direct" as const,
        id: conv.id,
        title,
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

  const threads: MessageThread[] = [...directThreads, ...groups].sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
  );

  return (
    <>
      <div className="messages-page w-full">
        <div className="messages-page-inner mx-auto w-full max-w-[42rem] px-6 pb-16 pt-24 md:pb-20 md:pt-32">
          <PageMotion>
            <header className="messages-page-head">
              <h1 className="messages-page-title">
                Messages
                {threads.length > 0 ? (
                  <span className="messages-page-count"> ({threads.length})</span>
                ) : null}
              </h1>
              <Link
                href="/dashboard/messages/groupes/nouveau"
                className="dashboard-listings-head-btn dashboard-listings-head-btn-dark messages-page-head-btn"
              >
                <HeaderIcon className="h-4 w-4">
                  <PlusIcon />
                </HeaderIcon>
                Groupe
              </Link>
            </header>

            <MessagesListPanel threads={threads} />
          </PageMotion>
        </div>
      </div>
      <Footer light />
    </>
  );
}
