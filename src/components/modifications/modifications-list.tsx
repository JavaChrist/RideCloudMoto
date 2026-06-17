"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import type { Modification } from "@/types/database";
import { formatDate } from "@/lib/utils/date";
import { formatEur } from "@/lib/costs";
import { addModification, deleteModification } from "@/app/(protected)/vehicule/[id]/actions";
import { useConfirm } from "@/components/providers/confirm-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ModificationsList({
  vehicleId,
  modifications,
}: {
  vehicleId: string;
  modifications: Modification[];
}) {
  const confirm = useConfirm();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await addModification(vehicleId, {
      titre: String(fd.get("titre") || ""),
      marque: (fd.get("marque") as string) || null,
      date_pose: (fd.get("date_pose") as string) || null,
      cout: fd.get("cout") ? Number(fd.get("cout")) : null,
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Modification ajoutée.");
      setOpen(false);
    } else {
      toast.error(res.error ?? "Erreur");
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: "Supprimer cette modification ?",
      variant: "danger",
      confirmText: "Supprimer",
    });
    if (!ok) return;
    const res = await deleteModification(vehicleId, id);
    if (res.ok) toast.success("Supprimée.");
    else toast.error(res.error ?? "Erreur");
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {open ? (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="mod-titre">Équipement / accessoire</Label>
                <Input id="mod-titre" name="titre" placeholder="Top-case, échappement, pare-mains…" required />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="mod-marque">Marque</Label>
                  <Input id="mod-marque" name="marque" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mod-date">Date de pose</Label>
                  <Input id="mod-date" name="date_pose" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mod-cout">Coût (€)</Label>
                  <Input id="mod-cout" name="cout" type="number" step="0.01" min="0" />
                </div>
              </div>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {modifications.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Aucune modification ou accessoire enregistré.
        </p>
      ) : (
        <div className="space-y-2">
          {modifications.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {m.titre}
                  </p>
                  <p className="pl-6 text-xs text-muted-foreground">
                    {[m.marque, m.date_pose ? formatDate(m.date_pose) : null, m.cout != null ? formatEur(m.cout) : null]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Supprimer" onClick={() => handleDelete(m.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
