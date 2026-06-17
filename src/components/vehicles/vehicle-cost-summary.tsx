import { Wallet, TrendingUp, Gauge } from "lucide-react";
import type { MaintenanceEntry, Modification, Vehicle } from "@/types/database";
import { computeVehicleCosts, formatEur } from "@/lib/costs";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  vehicle: Vehicle;
  entries: MaintenanceEntry[];
  modifications: Modification[];
}

export function VehicleCostSummary({ vehicle, entries, modifications }: Props) {
  const costs = computeVehicleCosts(vehicle, entries, modifications);

  const items = [
    { label: "Total dépensé", value: formatEur(costs.total), icon: Wallet },
    { label: "Coût / an", value: formatEur(costs.perYear), icon: TrendingUp },
    {
      label: "Coût / km",
      value: costs.perKm > 0 ? formatEur(costs.perKm) : "—",
      icon: Gauge,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex flex-col gap-1 p-4">
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-bold leading-tight">{item.value}</span>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
