"use client";

import Link from "next/link";
import { KeyRound, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import { DealerActivationForm } from "@/components/billing/dealer-activation-form";

export function AccessRequiredPanel() {
  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <Card className="border-primary/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Activez votre accès</CardTitle>
          <CardDescription>
            RideCloudMoto est accessible avec un <strong>code concessionnaire</strong> (offert
            à l&apos;achat de votre moto, 1 véhicule pendant 12 mois) ou un abonnement{" "}
            <strong>Premium</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <DealerActivationForm />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>
          <div className="space-y-3 text-center">
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Jusqu&apos;à 20 véhicules, notifications push et exports
            </p>
            <UpgradeButton className="w-full" label="Souscrire au Premium" />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tarifs">Comparer les formules</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
