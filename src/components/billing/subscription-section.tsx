import Link from "next/link";
import { Clock, Sparkles, CheckCircle2 } from "lucide-react";
import type { Profile } from "@/types/database";
import { getUserPlanState } from "@/lib/billing/limits";
import { formatDate } from "@/lib/utils/date";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UpgradeButton } from "./upgrade-button";
import { CancelSubscriptionButton } from "./cancel-subscription-button";
import { SyncSubscriptionButton } from "./sync-subscription-button";

export function SubscriptionSection({ profile }: { profile: Profile }) {
  const state = getUserPlanState(profile);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Abonnement</CardTitle>
          <Badge variant={state.effectivePlan === "premium" ? "default" : "secondary"}>
            {state.effectivePlan === "premium"
              ? state.isDealerOffer
                ? "Premium offert"
                : "Premium"
              : "Gratuit"}
          </Badge>
        </div>
        <CardDescription>Gérez votre formule RideCloudMoto.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.isDealerOffer ? (
          <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <span>
              Premium offert par votre concessionnaire jusqu&apos;au{" "}
              <strong>{formatDate(state.dealerPremiumUntil)}</strong>
              {state.dealerDaysLeft != null ? ` (${state.dealerDaysLeft} j restants)` : ""}.
              Souscrivez dès maintenant pour continuer sans interruption ensuite.
            </span>
          </div>
        ) : state.effectivePlan === "premium" ? (
          <p className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Abonnement actif
            {profile.plan_renews_at
              ? ` · renouvellement le ${formatDate(profile.plan_renews_at)}`
              : ""}
            {profile.plan_status === "canceled" ? " · résilié (actif jusqu'à échéance)" : ""}
          </p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Passez en Premium pour débloquer véhicules illimités, notifications et exports.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {state.effectivePlan === "premium" && !state.isDealerOffer && profile.plan_status !== "canceled" ? (
            <CancelSubscriptionButton />
          ) : (
            <UpgradeButton label={state.isDealerOffer ? "Souscrire maintenant" : "Passer en Premium"} />
          )}
          <SyncSubscriptionButton />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tarifs">Voir les tarifs</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
