import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** L'auteur clôt son alerte : status = resolved (résolu) ou cancelled (annulé). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const status = body.status === "cancelled" ? "cancelled" : "resolved";

  const admin = createAdminClient();
  const { data: alert } = await admin
    .from("sos_alerts")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();

  if (!alert) return NextResponse.json({ error: "Alerte introuvable" }, { status: 404 });
  if (alert.user_id !== user.id) {
    return NextResponse.json({ error: "Action réservée à l'auteur" }, { status: 403 });
  }

  const { error } = await admin
    .from("sos_alerts")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status });
}
