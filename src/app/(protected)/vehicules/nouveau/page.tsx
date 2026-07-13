import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getFormCatalog } from "@/lib/catalog/catalog-repository";
import { AddVehicleForm } from "@/components/vehicles/add-vehicle-form";
import { Button } from "@/components/ui/button";
import type { VehicleCategory } from "@/types/database";

export const metadata = { title: "Nouveau véhicule" };
export const dynamic = "force-dynamic";

export default async function NewVehiclePage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { categorie } = await searchParams;
  const defaultCategory =
    categorie === "motos" || categorie === "scooters" || categorie === "quads"
      ? (categorie as VehicleCategory)
      : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Marques du concessionnaire de rattachement : elles filtrent le catalogue.
  // Sans concessionnaire (ou sans marques renseignées), tout le catalogue est proposé.
  const { data: profile } = await supabase
    .from("profiles")
    .select("dealer_id")
    .eq("id", user!.id)
    .maybeSingle();

  let dealerBrands: string[] | null = null;
  if (profile?.dealer_id) {
    const { data: dealer } = await supabase
      .from("dealers")
      .select("brands")
      .eq("id", profile.dealer_id)
      .maybeSingle();
    dealerBrands = dealer?.brands?.length ? dealer.brands : null;
  }

  const catalog = await getFormCatalog(supabase, dealerBrands);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/categories">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
      </Button>
      <Suspense>
        <AddVehicleForm defaultCategory={defaultCategory} userId={user!.id} catalog={catalog} />
      </Suspense>
    </div>
  );
}
