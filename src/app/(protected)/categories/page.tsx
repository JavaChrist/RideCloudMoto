import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Plus, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ALL_CATEGORIES } from "@/lib/data/demo";
import { CategoryCard } from "@/components/categories/category-card";
import { RideCloudCrossSell } from "@/components/common/ridecloud-cross-sell";
import { Button } from "@/components/ui/button";
import type { VehicleCategory } from "@/types/database";

export const metadata: Metadata = { title: "Mes véhicules" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("category")
    .eq("user_id", user!.id);

  const counts: Record<VehicleCategory, number> = { motos: 0, scooters: 0 };
  (vehicles ?? []).forEach((v: { category: VehicleCategory }) => {
    counts[v.category] = (counts[v.category] ?? 0) + 1;
  });

  const total = counts.motos + counts.scooters;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-card p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Mon garage
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
              Choisissez une catégorie
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {total} véhicule{total > 1 ? "s" : ""} enregistré{total > 1 ? "s" : ""} · accédez à l&apos;historique complet de chaque véhicule.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/vehicules/nouveau">
              <Plus className="h-4 w-4" />
              Ajouter
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {ALL_CATEGORIES.map((category) => (
          <CategoryCard key={category} category={category} count={counts[category]} />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/sos"
          className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-accent"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
            <TriangleAlert className="h-5 w-5" />
          </span>
          <span className="text-sm">
            <span className="block font-semibold">SOS entraide</span>
            <span className="text-muted-foreground">Alerter les motards proches</span>
          </span>
        </Link>
        <Link
          href="/entraide"
          className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-accent"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="text-sm">
            <span className="block font-semibold">Culture motard</span>
            <span className="text-muted-foreground">Règles d&apos;or & le salut</span>
          </span>
        </Link>
      </div>

      <RideCloudCrossSell />
    </div>
  );
}
