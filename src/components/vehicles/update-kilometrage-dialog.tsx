"use client";

import * as React from "react";
import { toast } from "sonner";
import { Gauge, Loader2 } from "lucide-react";
import { updateKilometrage } from "@/app/(protected)/vehicules/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UpdateKilometrageDialog({
  vehicleId,
  currentKm,
}: {
  vehicleId: string;
  currentKm: number;
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [value, setValue] = React.useState(currentKm);

  async function handleSave() {
    if (value < 0) return;
    setLoading(true);
    const res = await updateKilometrage(vehicleId, value);
    setLoading(false);
    if (res.ok) {
      toast.success("Kilométrage mis à jour.");
      setOpen(false);
      window.location.reload();
    } else {
      toast.error(res.error ?? "Erreur");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Gauge className="h-4 w-4" />
          Mettre à jour le km
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mise à jour du kilométrage</DialogTitle>
          <DialogDescription>
            Saisissez le relevé actuel de votre compteur pour affiner les rappels.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="km">Kilométrage actuel</Label>
          <Input
            id="km"
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
