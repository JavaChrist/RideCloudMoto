"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useConfirm } from "@/components/providers/confirm-provider";
import { Button } from "@/components/ui/button";

export function CancelSubscriptionButton() {
  const router = useRouter();
  const confirm = useConfirm();
  const [loading, setLoading] = React.useState(false);

  async function handleCancel() {
    const ok = await confirm({
      title: "Résilier l'abonnement Premium ?",
      description: "Vous conserverez Premium jusqu'à la fin de la période déjà payée.",
      confirmText: "Résilier",
      variant: "warning",
    });
    if (!ok) return;
    setLoading(true);
    const res = await fetch("/api/billing/cancel", { method: "POST" });
    setLoading(false);
    if (res.ok) {
      toast.success("Abonnement résilié.");
      router.refresh();
    } else {
      toast.error("Échec de la résiliation.");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Résilier"}
    </Button>
  );
}
