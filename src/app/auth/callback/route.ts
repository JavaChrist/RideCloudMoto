import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/billing/ensure-profile";
import { isAdminEmail } from "@/lib/admin";
import { getDealerMembership } from "@/lib/dealer/membership";

export const dynamic = "force-dynamic";

/**
 * N'accepte qu'un chemin interne (commençant par un seul "/") pour éviter les
 * redirections ouvertes (ex. `//evil.com`, `/\evil.com`, `https://evil.com`).
 */
function safeInternalPath(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = safeInternalPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  if (data.user) {
    try {
      const admin = createAdminClient();
      const meta = data.user.user_metadata ?? {};
      const dealerCode =
        typeof meta.dealer_activation_code === "string" ? meta.dealer_activation_code : null;

      await ensureProfile(admin, data.user.id, data.user.email ?? "", {
        dealerActivationCode: dealerCode,
      });
    } catch (e) {
      console.error("[auth/callback] ensureProfile", e);
    }
  }

  // Si un `next` explicite est fourni, on le respecte ; sinon route selon le rôle.
  let destination = nextParam;
  if (!destination) {
    if (isAdminEmail(data.user?.email)) {
      destination = "/admin/dealer-codes";
    } else {
      const membership = data.user
        ? await getDealerMembership(supabase, data.user.id)
        : null;
      destination = membership ? "/portail" : "/categories";
    }
  }

  return NextResponse.redirect(`${origin}${destination}`);
}
