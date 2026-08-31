import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { PageMotion } from "@/components/layout/PageMotion";
import { ConvMessages } from "@/components/messages/ConvMessages";
import { ConvReplyForm } from "@/components/messages/ConvReplyForm";
import { getUserBankAccount } from "@/lib/profile-bank";
import { getUserProfile } from "@/lib/profile";
import { getAgentDisplayName } from "@/lib/agent-profiles";
import { getListingHref, sourceToIntent } from "@/lib/types";
import { getProfileHref } from "@/lib/profile-reviews";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login?next=/dashboard/messages");

  const { id } = await params;
  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("convs")
    .select("id, listing_id, src, owner_id, peer_id")
    .eq("id", id)
    .maybeSingle();

  if (!conv || (conv.owner_id !== user.id && conv.peer_id !== user.id)) {
    notFound();
  }

  const table = conv.src === "prod" ? "products" : "buy_requests";
  const otherUserId = conv.owner_id === user.id ? conv.peer_id : conv.owner_id;
  const isProfileConv = conv.src === "profile";

  const [
    { data: listing },
    { data: profile },
    { data: ownerProfile },
    { data: messages },
    userProfile,
    bankAccount,
  ] = await Promise.all([
    isProfileConv
      ? Promise.resolve({ data: null })
      : supabase.from(table).select("title").eq("id", conv.listing_id).maybeSingle(),
    supabase.from("profiles").select("username").eq("id", otherUserId).maybeSingle(),
    isProfileConv
      ? supabase
          .from("profiles")
          .select("name, username")
          .eq("id", conv.owner_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("conv_msgs")
      .select("id, sender_id, body, created_at, read_at")
      .eq("conv_id", conv.id)
      .order("created_at", { ascending: true }),
    getUserProfile(supabase, user.id),
    getUserBankAccount(supabase, user.id),
  ]);

  await supabase
    .from("conv_msgs")
    .update({ read_at: new Date().toISOString() })
    .eq("conv_id", conv.id)
    .neq("sender_id", user.id)
    .is("read_at", null);

  const listingTitle = isProfileConv
    ? ownerProfile
      ? `Profil · ${getAgentDisplayName({
          name: ownerProfile.name?.trim() ?? "",
          username: ownerProfile.username?.trim() ?? "",
        })}`
      : "Profil"
    : (listing?.title?.trim() ?? "");
  const otherUsername = profile?.username?.trim() ?? "";
  const otherName = otherUsername || "Utilisateur";
  const ownerUsername = ownerProfile?.username?.trim() ?? "";

  return (
    <PageMotion className="messages-conv-page">
      <div className="messages-conv-inner mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-6">
        <header className="messages-conv-head shrink-0">
          <Link href="/dashboard/messages" className="messages-conv-back">
            <ChevronLeft className="messages-conv-back-icon" aria-hidden strokeWidth={2} />
            Messages
          </Link>

          <div className="messages-conv-head-main">
            <div className="min-w-0">
              <h1 className="messages-conv-title">{listingTitle}</h1>
              <p className="messages-conv-subtitle">
                Avec{" "}
                {otherUsername ? (
                  <Link href={getProfileHref(otherUsername)} className="messages-conv-peer-link">
                    {otherName}
                  </Link>
                ) : (
                  otherName
                )}
              </p>
            </div>
            <Link
              href={
                isProfileConv && ownerUsername
                  ? getProfileHref(ownerUsername)
                  : getListingHref(conv.listing_id, sourceToIntent(conv.src))
              }
              className="messages-conv-listing-link shrink-0"
            >
              {isProfileConv ? "Voir le profil" : "Voir l'annonce"}
            </Link>
          </div>
        </header>

        <div className="messages-conv-panel">
          <ConvMessages>
            {(messages ?? []).map((message) => {
              const mine = message.sender_id === user.id;

              return (
                <div
                  key={message.id}
                  className={`messages-conv-row ${
                    mine ? "messages-conv-row-mine" : "messages-conv-row-other"
                  }`}
                >
                  <div
                    className={`messages-conv-bubble ${
                      mine ? "messages-conv-bubble-mine" : ""
                    }`}
                  >
                    <p className="messages-conv-bubble-body">{message.body}</p>
                    <time className="messages-conv-bubble-time">
                      {new Intl.DateTimeFormat("fr-CH", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(message.created_at))}
                    </time>
                  </div>
                </div>
              );
            })}
          </ConvMessages>
        </div>

        <ConvReplyForm
          convId={conv.id}
          phone={userProfile?.phone ?? ""}
          bankAccount={bankAccount}
        />
      </div>
    </PageMotion>
  );
}
