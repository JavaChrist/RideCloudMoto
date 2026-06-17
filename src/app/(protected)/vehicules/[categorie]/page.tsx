import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowLeft, Bike } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getVehiclesForUser,
} from "@/lib/data/vehicle-repository";
import { CATEGORY_META } from "@/lib/data/demo";
import { VehiclesGrid } from "@/components/vehicles/vehicles-grid";
import { Button } from "@/components/ui/button";
import type { MaintenancePlanEntry, VehicleCategory } from "@/types/database";

export const dynamic = "force-dynamic";

const VALID: VehicleCategory[] = ["motos", "scooters"];

export default async function CategoryVehiclesPage({
  params,
}: {
  params: Promise<{ categorie: string }>;
}) {
  const { categorie } = await params;
  if (!VALID.includes(categorie as VehicleCategory)) notFound();
  const category = categorie as VehicleCategory;
  const meta = CATEGORY_META[category];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const vehicles = await getVehiclesForUser(supabase, user!.id, category);

  const ids = vehicles.map((v) => v.id);
  let plansByVehicle: Record<string, MaintenancePlanEntry[]> = {};
  if (ids.length > 0) {
    const { data: plans } = await supabase
      .from("maintenance_plan_entries")
      .select("*")
      .in("vehicle_id", ids);
    plansByVehicle = (plans ?? []).reduce((acc: Record<string, MaintenancePlanEntry[]>, p: MaintenancePlanEntry) => {
      (acc[p.vehicle_id] ??= []).push(p);
      return acc;
    }, {});
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="Retour">
            <Link href="/categories">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{meta.label}</h1>
            <p className="text-sm text-muted-foreground">{meta.description}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/vehicules/nouveau?categorie=${category}`}>
            <Plus className="h-4 w-4" />
            Ajouter
          </Link>
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Bike className="mx-auto h-12 w-12 text-primary/70" strokeWidth={1.5} />
          <p className="mt-3 font-medium">Aucun {meta.labelSingular.toLowerCase()} pour l&apos;instant</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajoutez votre premier véhicule pour suivre son entretien.
          </p>
          <Button asChild className="mt-4">
            <Link href={`/vehicules/nouveau?categorie=${category}`}>
              <Plus className="h-4 w-4" />
              Ajouter un {meta.labelSingular.toLowerCase()}
            </Link>
          </Button>
        </div>
      ) : (
        <VehiclesGrid vehicles={vehicles} plansByVehicle={plansByVehicle} />
      )}
    </div>
  );
}
