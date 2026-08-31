import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { Footer } from "@/components/layout/Footer";
import { PageMotion } from "@/components/layout/PageMotion";
import {
  MessagesListPanel,
  type MessageConversation,
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

  const [listingTitles, profileTitles] = await Promise.all([
    getListingTitles(supabase, conversations),
    getProfileTitles(supabase, conversations),
  ]);

  const enriched: MessageConversation[] = await Promise.all(
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

  return (
    <>
      <div className="messages-page w-full">
        <div className="messages-page-inner mx-auto w-full max-w-[42rem] px-6 pb-16 pt-24 md:pb-20 md:pt-32">
          <PageMotion>
            <header className="messages-page-head">
              <h1 className="messages-page-title">
                Messages
                {enriched.length > 0 ? (
                  <span className="messages-page-count"> ({enriched.length})</span>
                ) : null}
              </h1>
            </header>

            <MessagesListPanel conversations={enriched} />
          </PageMotion>
        </div>
      </div>
      <Footer light />
    </>
  );
}
