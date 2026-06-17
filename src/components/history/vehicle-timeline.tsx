"use client";

import * as React from "react";
import { toast } from "sonner";
import { Wrench, Trash2 } from "lucide-react";
import type { MaintenanceEntry } from "@/types/database";
import { formatDate } from "@/lib/utils/date";
import { formatEur } from "@/lib/costs";
import { deleteMaintenanceEntry } from "@/app/(protected)/vehicule/[id]/actions";
import { useConfirm } from "@/components/providers/confirm-provider";
import { Button } from "@/components/ui/button";

export function VehicleTimeline({
  vehicleId,
  entries,
}: {
  vehicleId: string;
  entries: MaintenanceEntry[];
}) {
  const confirm = useConfirm();

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: "Supprimer cet entretien ?",
      description: "Cette action est irréversible.",
      confirmText: "Supprimer",
      variant: "danger",
    });
    if (!ok) return;
    const res = await deleteMaintenanceEntry(vehicleId, id);
    if (res.ok) toast.success("Entretien supprimé.");
    else toast.error(res.error ?? "Erreur");
  }

  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Aucun entretien enregistré pour l&apos;instant.
      </p>
    );
  }

  return (
    <ol className="relative space-y-4 border-l border-border pl-6">
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Wrench className="h-3 w-3" />
          </span>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">{entry.titre}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(entry.date_entretien)} · {entry.kilometrage.toLocaleString("fr-FR")} km
                {entry.cout != null ? ` · ${formatEur(entry.cout)}` : ""}
              </p>
              {entry.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Supprimer"
              onClick={() => handleDelete(entry.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </li>
      ))}
    </ol>
  );
}
