import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
import { formatDealerCodeDisplay } from "@/lib/billing/dealer-activation";

export const dynamic = "force-dynamic";

function csvEscape(value: string | null | undefined): string {
  const s = value ?? "";
  if (/[",;\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const dealer = searchParams.get("dealer");

  const admin = createAdminClient();
  let query = admin
    .from("dealer_activation_codes")
    .select(
      "code, dealer_name, customer_first_name, customer_last_name, customer_email, customer_phone, vehicle_model, purchase_date, used_by, used_at, created_at"
    )
    .order("created_at", { ascending: false });

  if (status === "unused") {
    query = query.is("used_by", null);
  } else if (status === "used") {
    query = query.not("used_by", "is", null);
  }
  if (dealer) {
    query = query.eq("dealer_name", dealer);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const headers = [
    "Immatriculation",
    "Concessionnaire",
    "Prénom",
    "Nom",
    "Email",
    "Téléphone",
    "Modèle véhicule",
    "Date d'achat",
    "Statut",
    "Date d'utilisation",
    "Créé le",
  ];

  const rows = (data ?? []).map((r) => [
    formatDealerCodeDisplay(r.code),
    r.dealer_name,
    r.customer_first_name,
    r.customer_last_name,
    r.customer_email,
    r.customer_phone,
    r.vehicle_model,
    r.purchase_date,
    r.used_by ? "Utilisé" : "Disponible",
    r.used_at ? new Date(r.used_at).toLocaleString("fr-FR") : "",
    new Date(r.created_at).toLocaleString("fr-FR"),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(";"))
    .join("\r\n");

  // BOM pour Excel (reconnaissance UTF-8)
  const body = "\uFEFF" + csv;

  const filename = `codes-concessionnaire-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
