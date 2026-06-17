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
    setLoading(false);
    if (res.ok) {
      toast.success("État de l'abonnement synchronisé.");
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
