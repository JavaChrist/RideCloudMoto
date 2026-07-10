import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/server";
import { isSosKind, SOS_KIND_EMOJI, SOS_KIND_LABELS } from "@/lib/sos/sos";
import type { SosAlert } from "@/types/database";

export const dynamic = "force-dynamic";

/** Liste les alertes SOS actives (le filtrage par distance se fait côté client). */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const admin = createAdminClient();
  const { data: alerts, error } = await admin
    .from("sos_alerts")
    .select("id, user_id, latitude, longitude, kind, note, contact_phone, status, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (alerts ?? []) as Array<
    Pick<
      SosAlert,
      | "id"
      | "user_id"
      | "latitude"
      | "longitude"
      | "kind"
      | "note"
      | "contact_phone"
      | "status"
      | "created_at"
    >
  >;

  // Enrichit avec le nom de l'auteur
  const userIds = [...new Set(rows.map((a) => a.user_id))];
  const names = new Map<string, string | null>();
  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);
    for (const p of profiles ?? []) names.set(p.id, p.full_name);
  }

  const enriched = rows.map((a) => ({
    ...a,
    author_name: names.get(a.user_id) ?? null,
    is_mine: a.user_id === user.id,
  }));

  return NextResponse.json({ alerts: enriched, currentUserId: user.id });
}

/** Déclenche une alerte SOS et notifie la communauté. */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let body: {
    latitude?: number;
    longitude?: number;
    kind?: string;
    note?: string;
    contactPhone?: string;
  };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { latitude, longitude } = body;
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    return NextResponse.json(
      { error: "Position GPS requise pour lancer un SOS." },
      { status: 400 }
    );
  }

  const kind = isSosKind(body.kind) ? body.kind : "panne";
  const note = body.note?.trim().slice(0, 280) || null;
  const contactPhone = body.contactPhone?.trim().slice(0, 30) || null;

  const admin = createAdminClient();

  // Empêche les doublons : réactive/renouvelle l'alerte active existante
  const { data: existing } = await admin
    .from("sos_alerts")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  let alertId: string;
  if (existing) {
    alertId = existing.id;
    await admin
      .from("sos_alerts")
      .update({ latitude, longitude, kind, note, contact_phone: contactPhone })
      .eq("id", alertId);
  } else {
    const { data: created, error } = await admin
      .from("sos_alerts")
      .insert({
        user_id: user.id,
        latitude,
        longitude,
        kind,
        note,
        contact_phone: contactPhone,
      })
      .select("id")
      .single();
    if (error || !created) {
      return NextResponse.json(
        { error: error?.message ?? "Impossible de créer l'alerte." },
        { status: 500 }
      );
    }
    alertId = created.id;
  }

  // Broadcast push à toute la communauté (sauf l'auteur). Le filtrage 30 km
  // s'effectue à l'affichage de la carte /sos.
  void broadcastSos(admin, user.id, kind, alertId);

  return NextResponse.json({ ok: true, id: alertId });
}

async function broadcastSos(
  admin: ReturnType<typeof createAdminClient>,
  authorId: string,
  kind: string,
  alertId: string
) {
  try {
    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("user_id")
      .neq("user_id", authorId);

    const targets = [...new Set((subs ?? []).map((s) => s.user_id as string))];
    const label = SOS_KIND_LABELS[kind as keyof typeof SOS_KIND_LABELS] ?? "SOS";
    const emoji = SOS_KIND_EMOJI[kind as keyof typeof SOS_KIND_EMOJI] ?? "🔴";

    await Promise.allSettled(
      targets.map((uid) =>
        sendPushToUser(admin, uid, {
          title: `${emoji} SOS motard — ${label}`,
          body: "Un motard proche a besoin d'aide. Touchez pour voir la carte.",
          url: `/sos?focus=${alertId}`,
          tag: "sos-alert",
        })
      )
    );
  } catch {
    /* le broadcast ne doit jamais bloquer la création du SOS */
  }
}
