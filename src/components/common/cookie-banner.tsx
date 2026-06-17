"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "rcm-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 p-4 shadow-lg backdrop-blur">
      <div className="container flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Nous utilisons uniquement des cookies nécessaires au fonctionnement de
          l&apos;application (session, préférences). En savoir plus :{" "}
          <Link href="/confidentialite" className="font-medium text-primary underline">
            confidentialité
          </Link>
          .
        </p>
        <Button size="sm" onClick={accept} className="shrink-0">
          J&apos;ai compris
        </Button>
      </div>
    </div>
  );
}
