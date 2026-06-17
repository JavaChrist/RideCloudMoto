"use client";

import * as React from "react";
import { toast } from "sonner";
import { Bell, BellOff, Loader2 } from "lucide-react";
import {
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  getPushSubscriptionState,
} from "@/lib/push/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PushNotificationsSection() {
  const [supported, setSupported] = React.useState(true);
  const [enabled, setEnabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setSupported(isPushSupported());
    getPushSubscriptionState().then(setEnabled).catch(() => {});
  }, []);

  async function toggle() {
    setLoading(true);
    try {
      if (enabled) {
        await unsubscribeFromPush();
        setEnabled(false);
        toast.success("Notifications désactivées.");
      } else {
        const ok = await subscribeToPush();
        if (ok) {
          setEnabled(true);
          toast.success("Notifications activées.");
        } else {
          toast.warning("Autorisation refusée.");
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notifications push</CardTitle>
        <CardDescription>
          Recevez vos rappels d&apos;entretien directement sur votre appareil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!supported ? (
          <p className="text-sm text-muted-foreground">
            Votre navigateur ne supporte pas les notifications push.
          </p>
        ) : (
          <Button variant={enabled ? "outline" : "default"} onClick={toggle} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : enabled ? (
              <BellOff className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            {enabled ? "Désactiver" : "Activer les notifications"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
