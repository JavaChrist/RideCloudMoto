import Link from "next/link";
import { Sparkles, CheckCircle2, KeyRound } from "lucide-react";
import type { Profile } from "@/types/database";
import { getUserPlanState } from "@/lib/billing/limits";
import { formatDate } from "@/lib/utils/date";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UpgradeButton } from "./upgrade-button";
import { CancelSubscriptionButton } from "./cancel-subscription-button";
import { SyncSubscriptionButton } from "./sync-subscription-button";
import { DealerActivationForm } from "./dealer-activation-form";
import { DealerOfferCountdown } from "./dealer-offer-countdown";

export function SubscriptionSection({ profile }: { profile: Profile }) {
  const state = getUserPlanState(profile);

  const badgeLabel = !state.hasAccess
    ? "Accès requis"
    : state.isDealerOffer
      ? "Gratuit concessionnaire"
      : state.effectivePlan === "premium"
        ? "Premium"
        : "Gratuit";

  return (
    <>
      {!state.hasAccess ? (
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Activer votre accès</CardTitle>
            </div>
            <CardDescription>
              Saisissez le code remis par votre concessionnaire ou souscrivez au Premium.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DealerActivationForm />
          </CardContent>
        </Card>
      ) : null}

      {state.isDealerOffer && state.dealerPremiumUntil ? (
        <DealerOfferCountdown
          expiresAt={state.dealerPremiumUntil.toISOString()}
          variant="card"
        />
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Abonnement</CardTitle>
            <Badge variant={state.effectivePlan === "premium" ? "default" : "secondary"}>
              {badgeLabel}
            </Badge>
          </div>
          <CardDescription>Gérez votre formule RideCloudMoto.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.isDealerOffer ? (
            <p className="text-sm text-muted-foreground">
              Offre gratuite concessionnaire · 1 véhicule. À l&apos;échéance, sans abonnement Premium,
              votre compte passe en lecture seule : vous gardez l&apos;accès à votre historique
              (consultation et export), mais vous ne pouvez plus le modifier.
            </p>
          ) : state.effectivePlan === "premium" ? (
            <p className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Abonnement Premium actif
              {profile.plan_renews_at
                ? ` · renouvellement le ${formatDate(profile.plan_renews_at)}`
                : ""}
              {profile.plan_status === "canceled" ? " · résilié (actif jusqu'à échéance)" : ""}
            </p>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Souscrivez au Premium pour accéder à RideCloudMoto.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {state.effectivePlan === "premium" && !state.isDealerOffer && profile.plan_status !== "canceled" ? (
              <CancelSubscriptionButton />
            ) : (
              <UpgradeButton
                label={state.isDealerOffer ? "Passer en Premium" : "Souscrire au Premium"}
              />
            )}
            <SyncSubscriptionButton />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tarifs">Voir les tarifs</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
