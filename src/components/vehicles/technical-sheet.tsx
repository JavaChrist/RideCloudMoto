import { ExternalLink, FileText, Info } from "lucide-react";
import type { Vehicle } from "@/types/database";
import { findCatalogModel, type VehicleSpecs } from "@/lib/data/vehicle-catalog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SPEC_LABELS: Record<keyof VehicleSpecs, string> = {
  cylindree: "Cylindrée",
  puissance: "Puissance",
  couple: "Couple",
  poids: "Poids",
  reservoir: "Réservoir",
  hauteurSelle: "Hauteur de selle",
  transmission: "Transmission",
  refroidissement: "Refroidissement",
  freinAvant: "Frein avant",
  freinArriere: "Frein arrière",
  pneuAvant: "Pneu avant",
  pneuArriere: "Pneu arrière",
  capaciteHuile: "Capacité huile",
  normeEuro: "Norme",
};

const SPEC_ORDER: (keyof VehicleSpecs)[] = [
  "cylindree",
  "puissance",
  "couple",
  "poids",
  "reservoir",
  "hauteurSelle",
  "transmission",
  "refroidissement",
  "freinAvant",
  "freinArriere",
  "pneuAvant",
  "pneuArriere",
  "capaciteHuile",
  "normeEuro",
];

export function TechnicalSheet({ vehicle }: { vehicle: Vehicle }) {
  const model = findCatalogModel(vehicle.category, vehicle.modele);

  if (!model) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
          <Info className="h-5 w-5 shrink-0" />
          Aucune fiche technique n&apos;est disponible pour ce modèle.
        </CardContent>
      </Card>
    );
  }

  const specs = model.specs;
  const rows = SPEC_ORDER.filter((k) => specs[k]).map((k) => ({
    label: SPEC_LABELS[k],
    value: specs[k]!,
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Caractéristiques techniques</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 border-b border-dashed pb-2 text-sm"
              >
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="text-right font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notice & documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {model.noticeUrl ? (
            <Button asChild variant="outline" className="w-full justify-between">
              <a href={model.noticeUrl} target="_blank" rel="noopener noreferrer">
                <span className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notice constructeur ({model.modele})
                </span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4 shrink-0" />
              La notice de ce modèle sera bientôt disponible. Rapprochez-vous de
              votre concessionnaire pour obtenir le manuel d&apos;utilisation.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
