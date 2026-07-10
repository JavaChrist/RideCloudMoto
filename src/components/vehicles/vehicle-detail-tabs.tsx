"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type {
  MaintenanceEntry,
  MaintenancePlanEntry,
  Modification,
  Vehicle,
  VehicleDocument,
} from "@/types/database";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaintenancePlanList } from "@/components/history/maintenance-plan-list";
import { HistorySections } from "@/components/history/history-sections";
import { ModificationsList } from "@/components/modifications/modifications-list";
import { DocumentsList } from "@/components/documents/documents-list";
import { TechnicalSheet } from "@/components/vehicles/technical-sheet";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { value: "plan", label: "Plan" },
  { value: "historique", label: "Historique" },
  { value: "technique", label: "Fiche technique" },
  { value: "modifs", label: "Accessoires" },
  { value: "docs", label: "Documents" },
] as const;

type SectionValue = (typeof SECTIONS)[number]["value"];

interface Props {
  vehicle: Vehicle;
  userId: string;
  planEntries: MaintenancePlanEntry[];
  maintenanceEntries: MaintenanceEntry[];
  modifications: Modification[];
  documents: VehicleDocument[];
  currentKm: number;
  isPremium: boolean;
  hasAccess: boolean;
  isReadOnly: boolean;
}

export function VehicleDetailTabs({
  vehicle,
  userId,
  planEntries,
  maintenanceEntries,
  modifications,
  documents,
  currentKm,
  isPremium,
  hasAccess,
  isReadOnly,
}: Props) {
  const [tab, setTab] = useState<SectionValue>("plan");

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as SectionValue)} className="w-full">
      <div className="relative md:hidden">
        <select
          value={tab}
          onChange={(event) => setTab(event.target.value as SectionValue)}
          className={cn(
            "flex h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm font-medium shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label="Section du véhicule"
        >
          {SECTIONS.map((section) => (
            <option key={section.value} value={section.value}>
              {section.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>

      <TabsList className="hidden w-full md:grid md:grid-cols-5">
        {SECTIONS.map((section) => (
          <TabsTrigger key={section.value} value={section.value}>
            {section.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="plan">
        <MaintenancePlanList vehicle={vehicle} planEntries={planEntries} />
      </TabsContent>

      <TabsContent value="historique">
        <HistorySections vehicleId={vehicle.id} entries={maintenanceEntries} currentKm={currentKm} />
      </TabsContent>

      <TabsContent value="technique">
        <TechnicalSheet vehicle={vehicle} />
      </TabsContent>

      <TabsContent value="modifs">
        <ModificationsList vehicleId={vehicle.id} modifications={modifications} />
      </TabsContent>

      <TabsContent value="docs">
        <DocumentsList
          vehicleId={vehicle.id}
          userId={userId}
          documents={documents}
          isPremium={isPremium}
          hasAccess={hasAccess}
          isReadOnly={isReadOnly}
        />
      </TabsContent>
    </Tabs>
  );
}
