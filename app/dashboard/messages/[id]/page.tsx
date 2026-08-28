import Link from "next/link";
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
    : (listing?.title ?? "Annonce");
  const otherUsername = profile?.username?.trim() ?? "";
  const otherName = otherUsername || "Utilisateur";
  const ownerUsername = ownerProfile?.username?.trim() ?? "";

  return (
    <PageMotion className="dashboard-page dashboard-conv-page">
      <header className="dashboard-conv-header">
        <Link
          href="/dashboard/messages"
          className="dashboard-conv-back text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          ← Retour aux messages
        </Link>

        <div className="dashboard-conv-header-main">
          <div className="min-w-0 flex-1">
            <h1 className="dashboard-conv-title">{listingTitle}</h1>
            <p className="dashboard-conv-subtitle">
              Avec{" "}
              {otherUsername ? (
                <Link href={getProfileHref(otherUsername)} className="dashboard-conv-peer-link">
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
            className="dashboard-conv-listing-link btn-ghost shrink-0 text-sm"
          >
            {isProfileConv ? "Voir le profil" : "Voir l'annonce"}
          </Link>
        </div>
      </header>

      <ConvMessages>
        {(messages ?? []).map((message) => {
          const mine = message.sender_id === user.id;

          return (
            <div
              key={message.id}
              className={`dashboard-conv-row ${
                mine ? "dashboard-conv-row-mine" : "dashboard-conv-row-other"
              }`}
            >
              <div
                className={`dashboard-conv-bubble ${
                  mine ? "dashboard-conv-bubble-mine" : ""
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-snug text-[var(--foreground)]">
                  {message.body}
                </p>
                <time className="mt-1.5 block text-[10px] text-[var(--muted-dim)]">
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

      <ConvReplyForm
        convId={conv.id}
        phone={userProfile?.phone ?? ""}
        bankAccount={bankAccount}
      />
    </PageMotion>
  );
}
