import { redirect } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { GroupPageSection } from "@/components/messages/GroupPageSection";
import { getCommunityProfiles } from "@/lib/agents";
import { getUser } from "@/lib/auth";

export default async function NewGroupPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/dashboard/messages/groupes/nouveau");

  const profiles = await getCommunityProfiles();

  return (
    <>
      <GroupPageSection profiles={profiles} currentUserId={user.id} />
      <Footer light />
    </>
  );
}
