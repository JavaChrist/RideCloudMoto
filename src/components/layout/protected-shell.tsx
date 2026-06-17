import Link from "next/link";
import { Clock } from "lucide-react";
import type { Profile } from "@/types/database";
import { getUserPlanState } from "@/lib/billing/limits";
import { ProtectedHeader } from "./protected-header";

interface ProtectedShellProps {
  profile: Profile | null;
  email: string;
  children: React.ReactNode;
}

export function ProtectedShell({ profile, children }: ProtectedShellProps) {
  const state = profile
    ? getUserPlanState(profile)
    : null;

  const showDealerBanner =
    state?.isDealerOffer && state.dealerDaysLeft != null && state.dealerDaysLeft <= 60;

  return (
    <div className="app-surface min-h-dvh">
      <ProtectedHeader
        isPremium={state?.effectivePlan === "premium"}
        isDealerOffer={!!state?.isDealerOffer}
      />
      <div className="h-16" aria-hidden />
      {showDealerBanner ? (
        <div className="border-b bg-warning/15">
          <div className="container flex items-center gap-2 py-2 text-sm">
            <Clock className="h-4 w-4 text-warning" />
            <span>
              Votre offre Premium se termine dans {state!.dealerDaysLeft} jour
              {state!.dealerDaysLeft! > 1 ? "s" : ""}.
            </span>
            <Link href="/parametres" className="font-medium text-primary underline">
              Continuer en Premium
            </Link>
          </div>
        </div>
      ) : null}
      <main className="container py-6">{children}</main>
    </div>
  );
}
