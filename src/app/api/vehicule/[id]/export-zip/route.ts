import { NextResponse, type NextRequest } from "next/server";
import JSZip from "jszip";
import { createClient } from "@/lib/supabase/server";
import { getVehicleDetail } from "@/lib/data/vehicle-repository";
import { getUserPlanState } from "@/lib/billing/limits";
import type { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

const BUCKET = "ridecloudmoto-files";

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

  const zip = new JSZip();
  zip.file(
    "carnet.json",
    JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        app: "RideCloudMoto",
        vehicle: detail.vehicle,
        maintenance_entries: detail.maintenanceEntries,
        maintenance_plan: detail.planEntries,
        modifications: detail.modifications,
      },
      null,
      2
    )
  );

  const docsFolder = zip.folder("documents");
  for (const doc of detail.documents) {
    try {
      const { data } = await supabase.storage.from(BUCKET).download(doc.url);
      if (data) {
        const buffer = Buffer.from(await data.arrayBuffer());
        docsFolder?.file(doc.nom_fichier, buffer);
      }
    } catch {
      // Ignorer les fichiers manquants
    }
  }

  const content = await zip.generateAsync({ type: "nodebuffer" });
  return new NextResponse(new Uint8Array(content), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="ridecloudmoto-${id}.zip"`,
    },
  });
}
