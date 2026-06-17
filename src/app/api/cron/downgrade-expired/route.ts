import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Rétrograde en bulk les abonnements payants résiliés et échus, et nettoie
 * l'état des offres concessionnaire expirées (plan reste 'free' si pas d'abo payant).
 */
async function run() {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: expired } = await admin
    .from("profiles")
    .select("id")
    .not("plan_canceled_at", "is", null)
    .lt("plan_renews_at", now)
    .eq("plan", "premium");

  let downgraded = 0;
  for (const p of expired ?? []) {
    const { error } = await admin
      .from("profiles")
      .update({ plan: "free", plan_status: "canceled" })
      .eq("id", (p as { id: string }).id);
    if (!error) downgraded += 1;
  }

  return { downgraded };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const result = await run();
  return NextResponse.json({ ok: true, ...result });
}
