import { NextResponse } from "next/server";
import { requireDealerApiContext } from "@/lib/dealer/membership";
import { registerPlateAsDealerCode } from "@/lib/billing/dealer-activation";

export const dynamic = "force-dynamic";

/** Liste les fiches/licences du concessionnaire connecté. */
export async function GET(request: Request) {
  const ctx = await requireDealerApiContext();
  if (!ctx) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // unused | used | all
  const limit = Math.min(Number(searchParams.get("limit") ?? 200), 300);

  let query = ctx.admin
    .from("dealer_activation_codes")
    .select(
      "id, code, dealer_name, customer_first_name, customer_last_name, customer_email, customer_phone, vehicle_model, purchase_date, used_by, used_at, expires_at, created_at"
    )
    .eq("dealer_id", ctx.membership.dealerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status === "unused") query = query.is("used_by", null);
  else if (status === "used") query = query.not("used_by", "is", null);

  const { data: codes, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ codes: codes ?? [] });
}

/** Enregistre une vente (immatriculation → code d'activation) pour ce concessionnaire. */
export async function POST(request: Request) {
  const ctx = await requireDealerApiContext();
  if (!ctx) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  let body: {
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
    return NextResponse.json({ error: "Immatriculation requise." }, { status: 400 });
  }

  const { data: dealer } = await ctx.admin
    .from("dealers")
    .select("name")
    .eq("id", ctx.membership.dealerId)
    .maybeSingle();

  const result = await registerPlateAsDealerCode(ctx.admin, plate, {
    dealerId: ctx.membership.dealerId,
    dealerName: dealer?.name ?? null,
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
  return NextResponse.json({ ok: true, code: result.code });
}
