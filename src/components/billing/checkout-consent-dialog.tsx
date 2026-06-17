"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { CHECKOUT_CONSENT_VERSION, PLANS } from "@/lib/billing/plans";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function CheckoutConsentDialog({
  open,
  onOpenChange,
  interval,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  interval: "monthly" | "yearly";
}) {
  const [consent, setConsent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const price = PLANS.premium.prices[interval];

  async function handleCheckout() {
    if (!consent) return;
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval, consentVersion: CHECKOUT_CONSENT_VERSION }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setLoading(false);
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Passer en Premium — {price?.label}</DialogTitle>
          <DialogDescription>
            Abonnement sans engagement, résiliable à tout moment depuis vos paramètres.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            En confirmant, vous demandez l&apos;exécution immédiate de l&apos;abonnement et
            reconnaissez perdre votre droit de rétractation une fois le service pleinement
            fourni, conformément à l&apos;article L221-28 du Code de la consommation.
          </p>
          <label className="flex items-start gap-2 text-foreground">
            <Checkbox checked={consent} onCheckedChange={setConsent} />
            <span>J&apos;accepte les CGV et la condition ci-dessus.</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleCheckout} disabled={!consent || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Payer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
