import { ExternalLink, FileText, Info } from "lucide-react";
import type { Vehicle } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/** Données catalogue (fiche technique + notice) résolues côté serveur. */
export interface TechnicalSheetData {
  specs: Record<string, string>;
  noticeUrl: string | null;
}

const SPEC_LABELS: Record<string, string> = {
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

const SPEC_ORDER = Object.keys(SPEC_LABELS);

export function TechnicalSheet({
  vehicle,
  catalog,
}: {
  vehicle: Vehicle;
  catalog: TechnicalSheetData | null;
}) {
  if (!catalog) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
          <Info className="h-5 w-5 shrink-0" />
          Aucune fiche technique n&apos;est disponible pour ce modèle.
        </CardContent>
      </Card>
    );
  }

  const specs = catalog.specs;
  const known = SPEC_ORDER.filter((k) => specs[k]).map((k) => ({
    label: SPEC_LABELS[k],
    value: specs[k],
  }));
  // Spécifications hors référentiel (clés libres ajoutées par l'admin).
  const extra = Object.keys(specs)
    .filter((k) => !SPEC_LABELS[k])
    .map((k) => ({ label: k, value: specs[k] }));
  const rows = [...known, ...extra];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Caractéristiques techniques</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4 shrink-0" />
              Les caractéristiques de ce modèle seront bientôt renseignées.
            </p>
          ) : (
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notice & documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {catalog.noticeUrl ? (
            <Button asChild variant="outline" className="w-full justify-between">
              <a href={catalog.noticeUrl} target="_blank" rel="noopener noreferrer">
                <span className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notice constructeur ({vehicle.modele})
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
