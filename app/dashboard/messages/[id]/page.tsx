import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { PageMotion } from "@/components/layout/PageMotion";
import { ConvReplyForm } from "@/components/messages/ConvReplyForm";
import { getListingHref, sourceToIntent } from "@/lib/types";

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

  const [{ data: listing }, { data: profile }, { data: messages }] = await Promise.all([
    supabase.from(table).select("title").eq("id", conv.listing_id).maybeSingle(),
    supabase.from("profiles").select("username").eq("id", otherUserId).maybeSingle(),
    supabase
      .from("conv_msgs")
      .select("id, sender_id, body, created_at, read_at")
      .eq("conv_id", conv.id)
      .order("created_at", { ascending: true }),
  ]);

  await supabase
    .from("conv_msgs")
    .update({ read_at: new Date().toISOString() })
    .eq("conv_id", conv.id)
    .neq("sender_id", user.id)
    .is("read_at", null);

  const listingTitle = listing?.title ?? "Annonce";
  const otherName = profile?.username?.trim() || "Utilisateur";

  return (
    <PageMotion className="dashboard-page dashboard-conv-page">
      <div className="dashboard-conv-header">
        <Link
          href="/dashboard/messages"
          className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          ← Retour aux messages
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="dashboard-page-title">{listingTitle}</h1>
            <p className="dashboard-page-desc">Avec {otherName}</p>
          </div>
          <Link
            href={getListingHref(conv.listing_id, sourceToIntent(conv.src))}
            className="btn-ghost text-sm"
          >
            Voir l&apos;annonce
          </Link>
        </div>
        <div className="dashboard-conv-header-divider" aria-hidden />
      </div>

      <div className="dashboard-conv-messages space-y-2">
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
      </div>

      <ConvReplyForm convId={conv.id} />
    </PageMotion>
  );
}
