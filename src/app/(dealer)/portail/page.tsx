import type { Metadata } from "next";
import Link from "next/link";
import { ListChecks, PlusCircle, ShoppingBag, Ticket, Users } from "lucide-react";
import { getDealerPortalContext } from "@/lib/dealer/membership";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Portail concessionnaire" };
export const dynamic = "force-dynamic";

async function countCodes(dealerId: string) {
  const admin = createAdminClient();
  const base = () =>
    admin
      .from("dealer_activation_codes")
      .select("id", { count: "exact", head: true })
      .eq("dealer_id", dealerId);

  const [{ count: total }, { count: used }] = await Promise.all([
    base(),
    base().not("used_by", "is", null),
  ]);

  return {
    total: total ?? 0,
    used: used ?? 0,
    available: (total ?? 0) - (used ?? 0),
  };
}

export default async function DealerPortalPage() {
  const ctx = await getDealerPortalContext();
  const dealerId = ctx!.dealer.id;
  const stats = await countCodes(dealerId);

  const cards = [
    { label: "Ventes enregistrées", value: stats.total, icon: ShoppingBag },
    { label: "Licences activées", value: stats.used, icon: Users },
    { label: "Fiches en attente", value: stats.available, icon: Ticket },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-card p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Bonjour {ctx!.dealer.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enregistrez vos ventes, suivez les licences de vos clients et prolongez-les
            après une révision.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/portail/ventes/nouvelle">
                <PlusCircle className="h-4 w-4" />
                Enregistrer une vente
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/portail/licences">
                <ListChecks className="h-4 w-4" />
                Voir les licences
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                  {c.label}
                  <Icon className="h-4 w-4 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{c.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
