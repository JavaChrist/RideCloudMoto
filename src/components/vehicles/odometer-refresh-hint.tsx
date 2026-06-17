import { Info } from "lucide-react";
import type { Vehicle } from "@/types/database";
import { shouldRemindOdometer } from "@/lib/odometer-estimate";
import { fromNow } from "@/lib/utils/date";

export function OdometerRefreshHint({ vehicle }: { vehicle: Vehicle }) {
  if (!shouldRemindOdometer(vehicle)) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <span>
        Dernier relevé de kilométrage {fromNow(vehicle.last_odometer_date)}. Mettez-le à jour
        pour des rappels d&apos;entretien plus précis.
      </span>
    </div>
  );
}
