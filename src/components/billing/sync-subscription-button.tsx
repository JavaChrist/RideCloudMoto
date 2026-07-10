"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SyncSubscriptionButton() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function handleSync() {
    setLoading(true);
    const res = await fetch("/api/billing/sync", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok && data?.premium) {
      toast.success(
        data?.recovered
          ? "Paiement retrouvé : votre Premium est activé !"
          : "Abonnement Premium synchronisé."
      );
      router.refresh();
    } else if (res.ok) {
      toast.info("Aucun abonnement actif trouvé pour ce compte.");
      router.refresh();
    } else {
      toast.error("Échec de la synchronisation.");
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSync} disabled={loading}>
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      Synchroniser
    </Button>
  );
}
