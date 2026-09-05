import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { PageMotion } from "@/components/layout/PageMotion";
import { ConvMessages } from "@/components/messages/ConvMessages";
import { GroupReplyForm } from "@/components/messages/GroupReplyForm";
import { GroupAvatar } from "@/components/messages/GroupAvatar";
import { getAgentDisplayName } from "@/lib/agent-profiles";
import { getProfileHref } from "@/lib/profile-reviews";

export default async function GroupConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login?next=/dashboard/messages");

  const { id } = await params;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("msg_group_members")
    .select("group_id, last_read_at")
    .eq("group_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    notFound();
  }

  const [
    { data: group },
    { data: members },
    { data: messages },
  ] = await Promise.all([
    supabase
      .from("msg_groups")
      .select("id, title, description, image_url, created_by, updated_at")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("msg_group_members")
      .select("user_id")
      .eq("group_id", id),
    supabase
      .from("msg_group_msgs")
      .select("id, sender_id, body, created_at")
      .eq("group_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!group) {
    notFound();
  }

  const memberIds = (members ?? []).map((member) => member.user_id);
  const { data: profiles } = memberIds.length
    ? await supabase
        .from("profiles")
        .select("id, username, name")
        .in("id", memberIds)
    : { data: [] };

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [
      profile.id,
      {
        username: profile.username?.trim() ?? "",
        name: getAgentDisplayName({
          name: profile.name?.trim() ?? "",
          username: profile.username?.trim() ?? "",
        }),
      },
    ]),
  );

  const memberNames = memberIds
    .map((memberId) => profileMap.get(memberId)?.name)
    .filter((name): name is string => Boolean(name));

  await supabase
    .from("msg_group_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("group_id", id)
    .eq("user_id", user.id);

  const subtitle =
    memberNames.length > 0
      ? `${memberNames.length} membre${memberNames.length > 1 ? "s" : ""} · ${memberNames.slice(0, 3).join(", ")}${memberNames.length > 3 ? "…" : ""}`
      : "Groupe";

  return (
    <PageMotion className="messages-conv-page">
      <div className="messages-conv-inner mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-6">
        <header className="messages-conv-head shrink-0">
          <Link href="/dashboard/messages" className="messages-conv-back">
            <ChevronLeft className="messages-conv-back-icon" aria-hidden strokeWidth={2} />
            Messages
          </Link>

          <div className="messages-conv-head-main messages-group-head-main">
            <div className="messages-group-head-content">
              <GroupAvatar
                title={group.title}
                imageUrl={group.image_url?.trim() ?? ""}
                size="md"
                className="messages-group-head-avatar shrink-0"
              />
              <div className="min-w-0">
                <h1 className="messages-conv-title">{group.title}</h1>
                <p className="messages-conv-subtitle">{subtitle}</p>
                {group.description?.trim() ? (
                  <p className="messages-group-description">{group.description.trim()}</p>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <div className="messages-conv-panel">
          <ConvMessages>
            {(messages ?? []).map((message) => {
              const mine = message.sender_id === user.id;
              const sender = profileMap.get(message.sender_id);
              const senderName = sender?.name ?? "Utilisateur";
              const senderUsername = sender?.username ?? "";

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
                    {!mine ? (
                      <p className="messages-group-sender">
                        {senderUsername ? (
                          <Link
                            href={getProfileHref(senderUsername)}
                            className="messages-conv-peer-link"
                          >
                            {senderName}
                          </Link>
                        ) : (
                          senderName
                        )}
                      </p>
                    ) : null}
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

        <GroupReplyForm groupId={group.id} />
      </div>
    </PageMotion>
  );
}
