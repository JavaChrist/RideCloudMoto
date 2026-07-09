import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { getDealerMembership } from "@/lib/dealer/membership";

export const dynamic = "force-dynamic";

export default async function PostLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (isAdminEmail(user.email)) {
    redirect("/admin/dealer-codes");
  }

  const membership = await getDealerMembership(supabase, user.id);
  if (membership) {
    redirect("/portail");
  }

  redirect("/categories");
}
