import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanState } from "@/lib/billing/limits";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { PricingCards } from "@/components/billing/pricing-cards";
import type { Profile } from "@/types/database";

export const metadata: Metadata = { title: "Tarifs" };
export const dynamic = "force-dynamic";

export default async function TarifsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentPlan: "free" | "premium" | "none" | undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (profile) {
      const state = getUserPlanState(profile as Profile);
      currentPlan = state.hasAccess ? state.effectivePlan : "none";
    }
  }

  return (
    <div className="min-h-dvh">
      <header className="safe-area-top safe-area-x sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 min-h-[var(--header-bar-height)] items-center justify-between sm:h-16">
          <Logo href="/" />
          <Button variant="ghost" size="sm" asChild>
            <Link href={user ? "/categories" : "/"}>
              <ArrowLeft className="h-4 w-4" />
              {user ? "Mon garage" : "Accueil"}
            </Link>
          </Button>
        </div>
      </header>
      <main className="container py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Des tarifs simples</h1>
          <p className="mt-2 text-muted-foreground">
            Accès via code concessionnaire (12 mois, 1 véhicule) ou abonnement Premium.
          </p>
        </div>
        <PricingCards currentPlan={currentPlan} />
      </main>
    </div>
  );
}
