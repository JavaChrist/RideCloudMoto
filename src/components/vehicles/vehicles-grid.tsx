"use client";

import * as React from "react";
import { Search } from "lucide-react";
import type { MaintenancePlanEntry, Vehicle } from "@/types/database";
import { getVehicleReminders, countActiveReminders } from "@/lib/reminders";
import { estimateCurrentKm } from "@/lib/odometer-estimate";
import { Input } from "@/components/ui/input";
import { VehicleCard } from "./vehicle-card";

interface Props {
  vehicles: Vehicle[];
  plansByVehicle: Record<string, MaintenancePlanEntry[]>;
}

export function VehiclesGrid({ vehicles, plansByVehicle }: Props) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) =>
      [v.surnom, v.marque, v.modele, String(v.annee), v.immatriculation]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [vehicles, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un véhicule…"
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucun véhicule ne correspond à « {query} ».
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((v) => {
            const reminders = getVehicleReminders(v, plansByVehicle[v.id] ?? []);
            const { total } = countActiveReminders(reminders);
            return (
              <VehicleCard
                key={v.id}
                vehicle={v}
                reminderCount={total}
                estimatedKm={estimateCurrentKm(v)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
