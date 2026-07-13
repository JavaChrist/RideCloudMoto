import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import { defaultIllustration } from "@/lib/data/demo";
import { findVogeManual } from "@/lib/vehicles/voge-manuals";
import { createClient } from "@/lib/supabase/server";
import { getVehicleDetail, ensureMaintenancePlanForVehicle } from "@/lib/data/vehicle-repository";
import { findCatalogModelDetail } from "@/lib/catalog/catalog-repository";
import { getUserPlanState } from "@/lib/billing/limits";
import { fuelLabel } from "@/lib/data/fuel-options";
import { CATEGORY_LABELS_SINGULAR } from "@/lib/data/categories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VehicleDetailTabs } from "@/components/vehicles/vehicle-detail-tabs";
import { VehicleCostSummary } from "@/components/vehicles/vehicle-cost-summary";
import { VehicleRemindersCard } from "@/components/vehicles/vehicle-reminders-card";
import { UpdateKilometrageDialog } from "@/components/vehicles/update-kilometrage-dialog";
import { OdometerRefreshHint } from "@/components/vehicles/odometer-refresh-hint";
import { VehicleActions } from "@/components/vehicles/vehicle-actions";
import { PrintExportButton } from "@/components/vehicles/print-export-button";
import type { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let detail = await getVehicleDetail(supabase, user!.id, id);
  if (!detail) notFound();

  // Génère le plan si absent (ex. véhicule importé avant la feature)
  if (detail.planEntries.length === 0) {
    await ensureMaintenancePlanForVehicle(supabase, detail.vehicle);
    detail = (await getVehicleDetail(supabase, user!.id, id))!;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .maybeSingle();
  const planState = getUserPlanState(profile as Profile);
  const isPremium = planState.effectivePlan === "premium";

  const { vehicle, estimatedKm } = detail;
  const title = vehicle.surnom || `${vehicle.marque} ${vehicle.modele}`;

  // Fiche catalogue (specs, notice) + repli manuel Voge France pour les Voge.
  const catalogModel = await findCatalogModelDetail(
    supabase,
    vehicle.marque,
    vehicle.category,
    vehicle.modele
  );
  const vogeManual = findVogeManual(vehicle.marque, vehicle.modele);
  const manual = catalogModel?.noticeUrl
    ? { label: `${vehicle.marque} ${vehicle.modele}`, url: catalogModel.noticeUrl }
    : vogeManual
      ? { label: `Voge ${vogeManual.label}`, url: vogeManual.url }
      : null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/vehicules/${vehicle.category}`}>
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div className="flex items-center gap-1">
          <PrintExportButton vehicleId={vehicle.id} isPremium={isPremium} />
          <VehicleActions vehicleId={vehicle.id} category={vehicle.category} title={title} />
        </div>
      </div>

      <div className="relative h-52 overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-card sm:h-64">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_20rem_at_50%_120%,rgba(250,204,21,0.18),transparent)]" />
        <Image
          src={vehicle.photo_url || defaultIllustration(vehicle.category)}
          alt={title}
          fill={Boolean(vehicle.photo_url)}
          width={vehicle.photo_url ? undefined : 420}
          height={vehicle.photo_url ? undefined : 240}
          priority
          className={
            vehicle.photo_url
              ? "object-cover"
              : "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain p-6 drop-shadow-[0_12px_24px_rgba(250,204,21,0.3)]"
          }
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight drop-shadow">{title}</h1>
            <Badge variant="secondary">{CATEGORY_LABELS_SINGULAR[vehicle.category]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {vehicle.marque} {vehicle.modele} · {vehicle.annee} · {fuelLabel(vehicle.carburant)}
            {vehicle.immatriculation ? ` · ${vehicle.immatriculation}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <div>
          <p className="text-xs text-muted-foreground">Kilométrage estimé</p>
          <p className="text-xl font-bold">{estimatedKm.toLocaleString("fr-FR")} km</p>
        </div>
        <UpdateKilometrageDialog vehicleId={vehicle.id} currentKm={vehicle.kilometrage} />
      </div>

      <OdometerRefreshHint vehicle={vehicle} />

      {manual ? (
        <a
          href={manual.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium">Manuel constructeur</span>
            <span className="block truncate text-sm text-muted-foreground">
              {manual.label} · notice d&apos;utilisation officielle
            </span>
          </span>
          <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
        </a>
      ) : null}

      <VehicleCostSummary
        vehicle={vehicle}
        entries={detail.maintenanceEntries}
        modifications={detail.modifications}
      />

      <VehicleRemindersCard vehicle={vehicle} planEntries={detail.planEntries} />

      <VehicleDetailTabs
        vehicle={vehicle}
        userId={user!.id}
        planEntries={detail.planEntries}
        maintenanceEntries={detail.maintenanceEntries}
        modifications={detail.modifications}
        documents={detail.documents}
        currentKm={estimatedKm}
        isPremium={isPremium}
        hasAccess={planState.hasAccess}
        isReadOnly={planState.isReadOnly}
        technicalSheet={
          catalogModel
            ? { specs: catalogModel.specs, noticeUrl: catalogModel.noticeUrl }
            : null
        }
      />
    </div>
  );
}
