"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutConsentDialog } from "./checkout-consent-dialog";

export function UpgradeButton({
  interval = "monthly",
  label = "Passer en Premium",
  className,
}: {
  interval?: "monthly" | "yearly";
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button className={className} onClick={() => setOpen(true)}>
        <Sparkles className="h-4 w-4" />
        {label}
      </Button>
      <CheckoutConsentDialog open={open} onOpenChange={setOpen} interval={interval} />
    </>
  );
}
