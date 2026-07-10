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
      const attempt = async (retriesLeft: number): Promise<void> => {
        try {
          const res = await fetch("/api/billing/sync", { method: "POST" });
          const data = await res.json().catch(() => ({}));
          if (data?.premium) {
            toast.success("Merci ! Votre abonnement Premium est actif.");
            router.replace("/parametres");
            router.refresh();
            return;
          }
          if (retriesLeft > 0) {
            // Le paiement peut mettre quelques secondes à être confirmé côté Mollie
            setTimeout(() => attempt(retriesLeft - 1), 3000);
            return;
          }
          toast.info(
            "Paiement reçu. L'activation peut prendre un instant — utilisez « Synchroniser » si besoin."
          );
          router.replace("/parametres");
          router.refresh();
        } catch {
          if (retriesLeft > 0) setTimeout(() => attempt(retriesLeft - 1), 3000);
        }
      };
      void attempt(3);
    }
  }, [searchParams, router]);

  return null;
}
