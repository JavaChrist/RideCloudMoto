import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Bannière affichée lorsque le compte est en lecture seule (offre terminée).
 * L'historique reste consultable et exportable, mais toute modification est bloquée.
 */
export function ReadOnlyBanner() {
  return (
    <div className="border-b border-amber-500/40 bg-amber-500/10">
      <div className="container flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Lock className="h-4 w-4 shrink-0" />
            Mode lecture seule
          </p>
          <p className="text-xs text-muted-foreground">
            Votre offre est terminée. Vous conservez l&apos;accès à votre historique, vos
            factures, vos documents et vos exports, mais l&apos;ajout et la modification
            sont désactivés.
          </p>
        </div>
        <Button size="sm" asChild className="shrink-0">
          <Link href="/parametres">
            <Sparkles className="h-4 w-4" />
            Réactiver en Premium
          </Link>
        </Button>
      </div>
    </div>
  );
}
