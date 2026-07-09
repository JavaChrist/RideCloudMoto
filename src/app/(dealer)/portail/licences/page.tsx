import type { Metadata } from "next";
import { DealerLicensesTable } from "@/components/dealer/licenses-table";

export const metadata: Metadata = { title: "Licences — Portail" };
export const dynamic = "force-dynamic";

export default function LicencesPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <DealerLicensesTable />
    </div>
  );
}
