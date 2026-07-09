import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
import { registerPlateAsDealerCode } from "@/lib/billing/dealer-activation";

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
    .select(
      "id, code, dealer_name, customer_first_name, customer_last_name, customer_email, customer_phone, vehicle_model, purchase_date, used_by, used_at, expires_at, created_at"
    )
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

  // Concessionnaires structurés (table dealers) pour rattacher un code.
  const { data: structuredDealers } = await admin
    .from("dealers")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  return NextResponse.json({
    codes: codes ?? [],
    dealers,
    structuredDealers: structuredDealers ?? [],
  });
}

/** Enregistre un code à partir de l'immatriculation du véhicule livré (admin). */
export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  let body: {
    dealerName?: string;
    dealerId?: string;
    plate?: string;
    customerFirstName?: string;
    customerLastName?: string;
    customerEmail?: string;
    customerPhone?: string;
    vehicleModel?: string;
    purchaseDate?: string;
  };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const plate = body.plate?.trim();
  if (!plate) {
    return NextResponse.json(
      { error: "Immatriculation requise." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const result = await registerPlateAsDealerCode(admin, plate, {
    dealerName: body.dealerName,
    dealerId: body.dealerId,
    customerFirstName: body.customerFirstName,
    customerLastName: body.customerLastName,
    customerEmail: body.customerEmail,
    customerPhone: body.customerPhone,
    vehicleModel: body.vehicleModel,
    purchaseDate: body.purchaseDate,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ codes: [result.code], plate: true });
}
