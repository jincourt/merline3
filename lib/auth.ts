import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("getUser failed:", error);
    return null;
  }
}

export async function getProfile() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email ?? "",
      full_name: profile?.full_name ?? user.user_metadata?.full_name ?? "",
      phone: profile?.phone ?? "",
    };
  } catch (error) {
    console.error("getProfile failed:", error);
    return null;
  }
}
