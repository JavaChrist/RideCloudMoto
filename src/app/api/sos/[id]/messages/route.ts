import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/server";
import type { SosMessage } from "@/types/database";

export const dynamic = "force-dynamic";

/** Liste les messages du chat d'une alerte. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const admin = createAdminClient();
  const { data: messages, error } = await admin
    .from("sos_messages")
    .select("id, sos_id, user_id, kind, body, created_at")
    .eq("sos_id", id)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (messages ?? []) as SosMessage[];
  const userIds = [...new Set(rows.map((m) => m.user_id))];
  const names = new Map<string, string | null>();
  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);
    for (const p of profiles ?? []) names.set(p.id, p.full_name);
  }

  const enriched = rows.map((m) => ({
    ...m,
    author_name: names.get(m.user_id) ?? null,
    is_mine: m.user_id === user.id,
  }));

  return NextResponse.json({ messages: enriched, currentUserId: user.id });
}

/** Poste un message (kind=message) ou un « J'arrive » (kind=coming). */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let body: { body?: string; kind?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const kind = body.kind === "coming" ? "coming" : "message";
  const text = body.body?.trim().slice(0, 500) || null;
  if (kind === "message" && !text) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: alert } = await admin
    .from("sos_alerts")
    .select("id, user_id, status")
    .eq("id", id)
    .maybeSingle();
  if (!alert) return NextResponse.json({ error: "Alerte introuvable" }, { status: 404 });

  const { error } = await admin.from("sos_messages").insert({
    sos_id: id,
    user_id: user.id,
    kind,
    body: kind === "coming" ? text ?? "J'arrive pour t'aider 🏍️" : text,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notifie l'auteur de l'alerte (sauf s'il écrit lui-même)
  if (alert.user_id !== user.id) {
    const { data: profile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    const who = profile?.full_name || "Un motard";
    void sendPushToUser(admin, alert.user_id, {
      title: kind === "coming" ? "🏍️ Un motard arrive !" : "💬 Nouveau message SOS",
      body: kind === "coming" ? `${who} vient t'aider.` : `${who} : ${text ?? ""}`.slice(0, 120),
      url: `/sos?focus=${id}`,
      tag: `sos-chat-${id}`,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
