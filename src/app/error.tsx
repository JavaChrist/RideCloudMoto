"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold">Une erreur est survenue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Désolé, quelque chose s&apos;est mal passé. Réessayez.
        </p>
      </div>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
