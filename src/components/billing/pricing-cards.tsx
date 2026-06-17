"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UpgradeButton } from "./upgrade-button";

export function PricingCards({ currentPlan }: { currentPlan?: "free" | "premium" }) {
  const [interval, setInterval] = React.useState<"monthly" | "yearly">("monthly");

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

      <div className="grid gap-4 sm:grid-cols-2">
        {(["free", "premium"] as const).map((planId) => {
          const plan = PLANS[planId];
          const price = plan.prices[interval];
          const isCurrent = currentPlan === planId;
          const isPremiumCard = planId === "premium";

          return (
            <Card
              key={planId}
              className={cn(isPremiumCard && "border-primary shadow-md")}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isPremiumCard ? <Badge>Recommandé</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                <p className="pt-2 text-3xl font-bold">
                  {price ? price.label : "Gratuit"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Votre offre actuelle
                  </Button>
                ) : isPremiumCard ? (
                  <UpgradeButton
                    interval={interval}
                    className="w-full"
                    label={`Choisir Premium`}
                  />
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
