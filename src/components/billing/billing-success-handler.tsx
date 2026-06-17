"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Au retour du paiement Mollie (?billing=success), déclenche une resync
 * de sécurité au cas où le webhook aurait pris du retard.
 */
export function BillingSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const done = React.useRef(false);

  React.useEffect(() => {
    if (done.current) return;
    if (searchParams.get("billing") === "success") {
      done.current = true;
      fetch("/api/billing/sync", { method: "POST" })
        .then(() => {
          toast.success("Merci ! Votre abonnement Premium est actif.");
          router.replace("/parametres");
          router.refresh();
        })
        .catch(() => {});
    }
  }, [searchParams, router]);

  return null;
}
