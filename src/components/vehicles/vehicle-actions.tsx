"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteVehicle } from "@/app/(protected)/vehicules/actions";
import { useConfirm } from "@/components/providers/confirm-provider";
import { Button } from "@/components/ui/button";

export function VehicleActions({
  vehicleId,
  category,
  title,
}: {
  vehicleId: string;
  category: string;
  title: string;
}) {
  const router = useRouter();
  const confirm = useConfirm();

  async function handleDelete() {
    const ok = await confirm({
      title: `Supprimer « ${title} » ?`,
      description: "Tout l'historique, le plan d'entretien et les documents seront supprimés. Action irréversible.",
      confirmText: "Supprimer définitivement",
      variant: "danger",
    });
    if (!ok) return;
    const res = await deleteVehicle(vehicleId);
    if (res.ok) {
      toast.success("Véhicule supprimé.");
      router.push(`/vehicules/${category}`);
      router.refresh();
    } else {
      toast.error(res.error ?? "Erreur");
    }
  }

  return (
    <Button variant="ghost" size="icon" aria-label="Supprimer le véhicule" onClick={handleDelete}>
      <Trash2 className="h-5 w-5 text-destructive" />
    </Button>
  );
}
