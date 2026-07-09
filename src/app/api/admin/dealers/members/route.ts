import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
import { ensureProfile } from "@/lib/billing/ensure-profile";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

/** Liste les comptes rattachés à un concessionnaire. */
export async function GET(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const dealerId = searchParams.get("dealerId");
  if (!dealerId) return NextResponse.json({ error: "dealerId requis" }, { status: 400 });

  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("dealer_users")
    .select("id, user_id, role, created_at")
    .eq("dealer_id", dealerId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const userIds = (rows ?? []).map((r) => r.user_id);
  const emailById = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, email")
      .in("id", userIds);
    (profiles ?? []).forEach((p) => emailById.set(p.id, p.email));
  }

  const members = (rows ?? []).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    role: r.role,
    created_at: r.created_at,
    email: emailById.get(r.user_id) ?? null,
  }));

  return NextResponse.json({ members });
}

/** Rattache un compte (par e-mail) à un concessionnaire. Invite le compte si besoin. */
export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  let body: { dealerId?: string; email?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const dealerId = body.dealerId?.trim();
  const email = body.email?.trim().toLowerCase();
  const role = body.role === "owner" ? "owner" : "staff";
  if (!dealerId || !email) {
    return NextResponse.json({ error: "Concessionnaire et e-mail requis." }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1. Compte déjà existant ?
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  let userId = existingProfile?.id ?? null;

  // 2. Sinon, inviter par e-mail (crée le compte).
  if (!userId) {
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email);
    if (inviteError || !invited?.user) {
      return NextResponse.json(
        {
          error:
            "Impossible d'inviter ce compte. Demandez à la personne de créer un compte avec cet e-mail, puis réessayez.",
        },
        { status: 400 }
      );
    }
    userId = invited.user.id;
    await ensureProfile(admin, userId, email);
  }

  // 3. Rattacher (un compte = un concessionnaire).
  const { data: member, error } = await admin
    .from("dealer_users")
    .upsert(
      { dealer_id: dealerId, user_id: userId, role },
      { onConflict: "user_id" }
    )
    .select("id, user_id, role, created_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ member: { ...member, email } });
}

/** Retire un compte d'un concessionnaire. */
export async function DELETE(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("dealer_users").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
