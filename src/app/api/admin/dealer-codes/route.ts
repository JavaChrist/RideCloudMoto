import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
import { generateDealerActivationCode, registerPlateAsDealerCode } from "@/lib/billing/dealer-activation";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return null;
  }
  return user;
}

/** Liste les codes d'activation (admin). */
export async function GET(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // unused | used | all
  const dealer = searchParams.get("dealer");
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 200);

  const admin = createAdminClient();
  let query = admin
    .from("dealer_activation_codes")
    .select("id, code, dealer_name, used_by, used_at, expires_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status === "unused") {
    query = query.is("used_by", null);
  } else if (status === "used") {
    query = query.not("used_by", "is", null);
  }

  if (dealer) {
    query = query.eq("dealer_name", dealer);
  }

  const { data: codes, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: dealersRows } = await admin
    .from("dealer_activation_codes")
    .select("dealer_name")
    .not("dealer_name", "is", null);

  const dealers = [
    ...new Set(
      (dealersRows ?? [])
        .map((r) => r.dealer_name)
        .filter((n): n is string => !!n?.trim())
    ),
  ].sort();

  return NextResponse.json({ codes: codes ?? [], dealers });
}

/** Génère des codes d'activation concessionnaire (admin). */
export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  let body: { count?: number; dealerName?: string; plate?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const dealerName = body.dealerName?.trim() || null;
  const admin = createAdminClient();

  // Code = immatriculation du véhicule livré
  if (body.plate?.trim()) {
    const result = await registerPlateAsDealerCode(admin, body.plate, dealerName);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ codes: [result.code], dealerName, plate: true });
  }

  const count = Math.min(Math.max(body.count ?? 1, 1), 50);
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    let inserted = false;
    for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
      const code = generateDealerActivationCode();
      const { error } = await admin.from("dealer_activation_codes").insert({
        code,
        dealer_name: dealerName,
      });
      if (!error) {
        codes.push(code);
        inserted = true;
      }
    }
  }

  if (codes.length === 0) {
    return NextResponse.json({ error: "Impossible de générer les codes" }, { status: 500 });
  }

  return NextResponse.json({ codes, dealerName });
}
