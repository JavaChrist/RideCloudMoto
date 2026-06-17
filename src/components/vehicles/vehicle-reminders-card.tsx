import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import type { MaintenancePlanEntry, Vehicle } from "@/types/database";
import { getVehicleReminders, countActiveReminders } from "@/lib/reminders";
import { formatDate } from "@/lib/utils/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function VehicleRemindersCard({
  vehicle,
  planEntries,
}: {
  vehicle: Vehicle;
  planEntries: MaintenancePlanEntry[];
}) {
  const reminders = getVehicleReminders(vehicle, planEntries);
  const { overdue, dueSoon } = countActiveReminders(reminders);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          Rappels d&apos;entretien
          <span className="flex gap-2">
            {overdue > 0 ? (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {overdue}
              </Badge>
            ) : null}
            {dueSoon > 0 ? (
              <Badge variant="warning" className="gap-1">
                <Clock className="h-3 w-3" />
                {dueSoon}
              </Badge>
            ) : null}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Tout est à jour, rien à prévoir pour le moment.
          </p>
        ) : (
          <ul className="space-y-2">
            {reminders.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  {r.status === "overdue" ? (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                  ) : (
                    <Clock className="h-4 w-4 shrink-0 text-warning" />
                  )}
                  <span className="font-medium">{r.titre}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {r.nextDueKm != null ? `${r.nextDueKm.toLocaleString("fr-FR")} km` : ""}
                  {r.nextDueDate ? ` · ${formatDate(r.nextDueDate)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
