import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getVehicleDetail } from "@/lib/data/vehicle-repository";
import { getUserPlanState } from "@/lib/billing/limits";
import type { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (getUserPlanState(profile as Profile).effectivePlan !== "premium") {
    return NextResponse.json({ error: "Premium requis" }, { status: 403 });
  }

  const detail = await getVehicleDetail(supabase, user.id, id);
  if (!detail) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const payload = {
    exported_at: new Date().toISOString(),
    app: "RideCloudMoto",
    vehicle: detail.vehicle,
    maintenance_entries: detail.maintenanceEntries,
    maintenance_plan: detail.planEntries,
    modifications: detail.modifications,
    documents: detail.documents.map((d) => ({ ...d, url: undefined })),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ridecloudmoto-${id}.json"`,
    },
  });
}
