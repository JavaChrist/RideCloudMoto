import type { Profile } from "@/types/database";
import { getUserPlanState } from "@/lib/billing/limits";
import { PaywallGate } from "@/components/billing/paywall-gate";
import { DealerOfferCountdown } from "@/components/billing/dealer-offer-countdown";
import { ProtectedHeader } from "./protected-header";

interface ProtectedShellProps {
  profile: Profile | null;
  email: string;
  isAdmin?: boolean;
  children: React.ReactNode;
}

export function ProtectedShell({ profile, isAdmin = false, children }: ProtectedShellProps) {
  const state = profile ? getUserPlanState(profile) : null;
  const effectiveAccess = !!state?.hasAccess || isAdmin;

  const showDealerCountdown =
    state?.hasAccess &&
    state.isDealerOffer &&
    state.dealerPremiumUntil != null;

  return (
    <div className="app-surface min-h-dvh">
      <ProtectedHeader
        isPremium={state?.effectivePlan === "premium"}
        isDealerOffer={!!state?.isDealerOffer}
        hasAccess={effectiveAccess}
        dealerDaysLeft={state?.dealerDaysLeft ?? null}
      />
      <div className="header-spacer" aria-hidden />
      {showDealerCountdown ? (
        <DealerOfferCountdown
          expiresAt={state!.dealerPremiumUntil!.toISOString()}
          variant="banner"
        />
      ) : null}
      <main className="container py-6">
        <PaywallGate hasAccess={!!state?.hasAccess} isAdmin={isAdmin}>
          {children}
        </PaywallGate>
      </main>
    </div>
  );
}
