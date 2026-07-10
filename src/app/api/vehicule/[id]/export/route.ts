import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getVehicleDetail } from "@/lib/data/vehicle-repository";

export const dynamic = "force-dynamic";

// L'export JSON (portabilité des données) est disponible pour tous les comptes,
// y compris l'offre gratuite et le mode lecture seule. Seul l'export ZIP est Premium.
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
