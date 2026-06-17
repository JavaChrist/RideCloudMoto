import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/billing/ensure-profile";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/categories";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Création idempotente du profil + offre Premium concessionnaire
  if (data.user) {
    try {
      const admin = createAdminClient();
      await ensureProfile(admin, data.user.id, data.user.email ?? "");
    } catch (e) {
      console.error("[auth/callback] ensureProfile", e);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
