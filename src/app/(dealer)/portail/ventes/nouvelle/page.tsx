import type { Metadata } from "next";
import { DealerSaleForm } from "@/components/dealer/sale-form";

export const metadata: Metadata = { title: "Nouvelle vente — Portail" };
export const dynamic = "force-dynamic";

export default function NouvelleVentePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <DealerSaleForm />
    </div>
  );
}
