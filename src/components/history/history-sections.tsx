"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import type { MaintenanceEntry } from "@/types/database";
import { addMaintenanceEntry } from "@/app/(protected)/vehicule/[id]/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VehicleTimeline } from "./vehicle-timeline";

export function HistorySections({
  vehicleId,
  entries,
  currentKm,
}: {
  vehicleId: string;
  entries: MaintenanceEntry[];
  currentKm: number;
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await addMaintenanceEntry(vehicleId, {
      titre: String(fd.get("titre") || ""),
      date_entretien: String(fd.get("date_entretien") || ""),
      kilometrage: Number(fd.get("kilometrage") || 0),
      cout: fd.get("cout") ? Number(fd.get("cout")) : null,
      description: (fd.get("description") as string) || null,
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Entretien enregistré.");
      setOpen(false);
    } else {
      toast.error(res.error ?? "Erreur");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
          <Plus className="h-4 w-4" />
          Ajouter un entretien
        </Button>
      </div>

      {open ? (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="he-titre">Intitulé</Label>
                <Input id="he-titre" name="titre" placeholder="Vidange, plaquettes…" required />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="he-date">Date</Label>
                  <Input
                    id="he-date"
                    name="date_entretien"
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="he-km">Kilométrage</Label>
                  <Input id="he-km" name="kilometrage" type="number" min={0} defaultValue={currentKm} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="he-cout">Coût (€)</Label>
                  <Input id="he-cout" name="cout" type="number" step="0.01" min="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="he-desc">Note (optionnel)</Label>
                <Textarea id="he-desc" name="description" rows={2} />
              </div>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <VehicleTimeline vehicleId={vehicleId} entries={entries} />
    </div>
  );
}
