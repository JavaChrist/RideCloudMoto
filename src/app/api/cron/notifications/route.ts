import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/server";
import { getVehicleReminders, countActiveReminders } from "@/lib/reminders";
import type { MaintenancePlanEntry, Vehicle } from "@/types/database";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

async function run() {
  const admin = createAdminClient();
  const TASK_COOLDOWN_DAYS = 7;

  // Récupère tous les utilisateurs ayant au moins une souscription push
  const { data: subs } = await admin.from("push_subscriptions").select("user_id");
  const userIds = Array.from(new Set((subs ?? []).map((s: { user_id: string }) => s.user_id)));

  let notified = 0;

  for (const userId of userIds) {
    const { data: vehicles } = await admin
      .from("vehicles")
      .select("*")
      .eq("user_id", userId);
    if (!vehicles || vehicles.length === 0) continue;

    const ids = vehicles.map((v: Vehicle) => v.id);
    const { data: plans } = await admin
      .from("maintenance_plan_entries")
      .select("*")
      .in("vehicle_id", ids);

    const plansByVehicle = (plans ?? []).reduce(
      (acc: Record<string, MaintenancePlanEntry[]>, p: MaintenancePlanEntry) => {
        (acc[p.vehicle_id] ??= []).push(p);
        return acc;
      },
      {}
    );

    let totalOverdue = 0;
    let totalDueSoon = 0;
    for (const v of vehicles as Vehicle[]) {
      const reminders = getVehicleReminders(v, plansByVehicle[v.id] ?? []);
      const { overdue, dueSoon } = countActiveReminders(reminders);
      totalOverdue += overdue;
      totalDueSoon += dueSoon;
    }

    if (totalOverdue + totalDueSoon === 0) continue;

    // Anti-spam : 1 push de rappel d'entretien / 7 jours / utilisateur
    const since = new Date(Date.now() - TASK_COOLDOWN_DAYS * 86400000).toISOString();
    const { data: recent } = await admin
      .from("notification_log")
      .select("id")
      .eq("user_id", userId)
      .eq("kind", "maintenance_reminder")
      .gte("sent_at", since)
      .limit(1);
    if (recent && recent.length > 0) continue;

    const body =
      totalOverdue > 0
        ? `${totalOverdue} entretien(s) en retard${totalDueSoon > 0 ? ` et ${totalDueSoon} bientôt dû(s)` : ""}.`
        : `${totalDueSoon} entretien(s) à prévoir prochainement.`;

    try {
      const { sent } = await sendPushToUser(admin, userId, {
        title: "RideCloudMoto · Rappel d'entretien",
        body,
        url: "/categories",
        tag: "maintenance",
      });
      if (sent > 0) {
        notified += 1;
        await admin
          .from("notification_log")
          .insert({ user_id: userId, kind: "maintenance_reminder", ref_key: body });
      }
    } catch (e) {
      console.error("[cron/notifications] push", userId, e);
    }
  }

  return { notified, users: userIds.length };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const result = await run();
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
