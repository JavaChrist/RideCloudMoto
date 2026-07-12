import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/billing/ensure-profile";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { isAdminEmail } from "@/lib/admin";
import { getDealerById } from "@/lib/dealer/dealer-info";
import { getDealerMembership } from "@/lib/dealer/membership";
import type { Dealer, Profile } from "@/types/database";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/login?unverified=1");

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Filet de sécurité : crée le profil si absent (sans offre automatique)
  if (!profile) {
    try {
      const admin = createAdminClient();
      await ensureProfile(admin, user.id, user.email ?? "");
      const refetch = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      profile = refetch.data;
    } catch {
      // non bloquant
    }
  }

  const isAdmin = isAdminEmail(user.email);

  const dealerMembership = await getDealerMembership(supabase, user.id);
  const isDealerStaff = !!dealerMembership;

  let dealer: Dealer | null = null;
  const dealerId = (profile as Profile | null)?.dealer_id ?? null;
  if (dealerId) {
    try {
      dealer = await getDealerById(supabase, dealerId);
    } catch {
      // non bloquant
    }
  }

  return (
    <ProtectedShell
      profile={(profile as Profile) ?? null}
      email={user.email ?? ""}
      isAdmin={isAdmin}
      isDealerStaff={isDealerStaff}
      dealer={dealer}
    >
      {children}
    </ProtectedShell>
  );
}
