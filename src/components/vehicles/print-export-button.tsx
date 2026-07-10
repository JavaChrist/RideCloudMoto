"use client";

import * as React from "react";
import { toast } from "sonner";
import { Download, FileJson, FileArchive, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function PrintExportButton({
  vehicleId,
  isPremium,
}: {
  vehicleId: string;
  isPremium: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<string | null>(null);

  async function download(kind: "json" | "zip") {
    if (kind === "zip" && !isPremium) {
      toast.error("L'archive ZIP (avec documents) est réservée au Premium.");
      return;
    }
    setLoading(kind);
    try {
      const url = kind === "json"
        ? `/api/vehicule/${vehicleId}/export`
        : `/api/vehicule/${vehicleId}/export-zip`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Export impossible");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `ridecloudmoto-${vehicleId}.${kind === "json" ? "json" : "zip"}`;
      a.click();
      URL.revokeObjectURL(a.href);
      setOpen(false);
    } catch (e) {
      toast.error("Échec de l'export.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Exporter le carnet</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => download("json")} disabled={!!loading}>
            {loading === "json" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileJson className="h-4 w-4" />}
            Données JSON
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => download("zip")}
            disabled={!!loading || !isPremium}
          >
            {loading === "zip" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileArchive className="h-4 w-4" />}
            Archive ZIP (données + documents)
            {!isPremium ? <span className="ml-auto text-xs text-muted-foreground">Premium</span> : null}
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Imprimer / PDF
          </Button>
        </div>
        {!isPremium ? (
          <p className="text-center text-xs text-muted-foreground">
            Export JSON inclus dans l&apos;offre gratuite · l&apos;archive ZIP nécessite le Premium.
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
