"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2, Circle, AlertTriangle, Clock } from "lucide-react";
import type { MaintenancePlanEntry, Vehicle } from "@/types/database";
import { getMaintenanceStatus, MAINTENANCE_STATUS_LABELS, compareMaintenanceByDue, MAINTENANCE_STATUS_SORT_ORDER } from "@/lib/maintenance";
import { estimateCurrentKm } from "@/lib/odometer-estimate";
import { formatDate } from "@/lib/utils/date";
import { addMaintenanceEntry } from "@/app/(protected)/vehicule/[id]/actions";
import { useConfirm } from "@/components/providers/confirm-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  vehicle: Vehicle;
  planEntries: MaintenancePlanEntry[];
}

const STATUS_META = {
  overdue: { variant: "destructive" as const, icon: AlertTriangle },
  due_soon: { variant: "warning" as const, icon: Clock },
  upcoming: { variant: "secondary" as const, icon: Circle },
  done: { variant: "success" as const, icon: CheckCircle2 },
};

export function MaintenancePlanList({ vehicle, planEntries }: Props) {
  const confirm = useConfirm();
  const currentKm = estimateCurrentKm(vehicle);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const computed = planEntries
    .map((p) => ({
      entry: p,
      status: getMaintenanceStatus({
        nextDueKm: p.next_due_km,
        nextDueDate: p.next_due_date,
        currentKm,
        dueSoonKmThreshold: p.due_soon_km_threshold,
        dueSoonDaysThreshold: p.due_soon_days_threshold,
      }),
    }))
    .sort((a, b) => {
      const statusDiff =
        MAINTENANCE_STATUS_SORT_ORDER[a.status] - MAINTENANCE_STATUS_SORT_ORDER[b.status];
      if (statusDiff !== 0) return statusDiff;
      return compareMaintenanceByDue(a.entry, b.entry, currentKm);
    });

  async function markDone(p: MaintenancePlanEntry) {
    const ok = await confirm({
      title: `Marquer « ${p.titre} » comme effectué ?`,
      description: `L'opération sera enregistrée à ${currentKm.toLocaleString("fr-FR")} km aujourd'hui et la prochaine échéance recalculée.`,
      confirmText: "Confirmer",
      variant: "success",
    });
    if (!ok) return;
    setPendingId(p.id);
    const res = await addMaintenanceEntry(
      vehicle.id,
      {
        titre: p.titre,
        date_entretien: new Date().toISOString().slice(0, 10),
        kilometrage: currentKm,
        cout: null,
        description: `Entretien planifié (${p.categorie})`,
      },
      p.id
    );
    setPendingId(null);
    if (res.ok) toast.success("Entretien enregistré.");
    else toast.error(res.error ?? "Erreur");
  }

  if (planEntries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Aucun plan d&apos;entretien généré pour ce véhicule.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {computed.map(({ entry, status }) => {
        const meta = STATUS_META[status];
        const Icon = meta.icon;
        return (
          <Card key={entry.id}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="truncate font-medium">{entry.titre}</p>
                  <Badge variant={meta.variant} className="shrink-0">
                    {MAINTENANCE_STATUS_LABELS[status]}
                  </Badge>
                </div>
                <p className="mt-1 pl-6 text-xs text-muted-foreground">
                  {entry.categorie}
                  {entry.next_due_km != null
                    ? ` · échéance ${entry.next_due_km.toLocaleString("fr-FR")} km`
                    : ""}
                  {entry.next_due_date ? ` · ${formatDate(entry.next_due_date)}` : ""}
                </p>
              </div>
              <Button
                size="sm"
                variant={status === "upcoming" ? "ghost" : "outline"}
                disabled={pendingId === entry.id}
                onClick={() => markDone(entry)}
                aria-label={`Marquer « ${entry.titre} » comme effectué`}
              >
                {status === "upcoming" ? "Anticiper" : "Effectuer"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
