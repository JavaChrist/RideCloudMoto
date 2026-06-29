"use client";

import * as React from "react";
import { Check, KeyRound } from "lucide-react";
import { PLANS } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UpgradeButton } from "./upgrade-button";

type CurrentPlan = "free" | "premium" | "none";

export function PricingCards({ currentPlan }: { currentPlan?: CurrentPlan }) {
  const [interval, setInterval] = React.useState<"monthly" | "yearly">("monthly");
  const dealerPlan = PLANS.free;
  const premiumPlan = PLANS.premium;
  const premiumPrice = premiumPlan.prices[interval];

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border p-1">
          {(["monthly", "yearly"] as const).map((i) => (
            <button
              key={i}
              onClick={() => setInterval(i)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                interval === i ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              {i === "monthly" ? "Mensuel" : "Annuel"}
              {i === "yearly" ? <span className="ml-1 text-xs">(-16%)</span> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{dealerPlan.name} concessionnaire</CardTitle>
              <Badge variant="secondary">Code requis</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Offert à l&apos;achat de votre moto · 12 mois · 1 véhicule
            </p>
            <p className="pt-2 text-3xl font-bold">0 €</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {dealerPlan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  {f}
                </li>
              ))}
            </ul>
            {currentPlan === "free" ? (
              <Button variant="outline" className="w-full" disabled>
                Votre offre actuelle
              </Button>
            ) : (
              <Button variant="outline" className="w-full gap-2" disabled>
                <KeyRound className="h-4 w-4" />
                Code remis par le concessionnaire
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{premiumPlan.name}</CardTitle>
              <Badge>Recommandé</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{premiumPlan.tagline}</p>
            <p className="pt-2 text-3xl font-bold">{premiumPrice?.label ?? "—"}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {premiumPlan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  {f}
                </li>
              ))}
            </ul>
            {currentPlan === "premium" ? (
              <Button variant="outline" className="w-full" disabled>
                Votre offre actuelle
              </Button>
            ) : (
              <UpgradeButton interval={interval} className="w-full" label="Choisir Premium" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
