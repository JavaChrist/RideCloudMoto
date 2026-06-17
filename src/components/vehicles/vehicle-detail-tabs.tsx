"use client";

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

interface Props {
  vehicle: Vehicle;
  userId: string;
  planEntries: MaintenancePlanEntry[];
  maintenanceEntries: MaintenanceEntry[];
  modifications: Modification[];
  documents: VehicleDocument[];
  currentKm: number;
  isPremium: boolean;
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
}: Props) {
  return (
    <Tabs defaultValue="plan" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="plan">Plan</TabsTrigger>
        <TabsTrigger value="historique">Historique</TabsTrigger>
        <TabsTrigger value="technique">Fiche technique</TabsTrigger>
        <TabsTrigger value="modifs">Accessoires</TabsTrigger>
        <TabsTrigger value="docs">Documents</TabsTrigger>
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
          canUpload={isPremium}
        />
      </TabsContent>
    </Tabs>
  );
}
