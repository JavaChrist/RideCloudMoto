import type { CSSProperties } from "react";
import type { Dealer, Profile } from "@/types/database";
import { getUserPlanState } from "@/lib/billing/limits";
import { hexToHslString } from "@/lib/dealer/branding";
import { PaywallGate } from "@/components/billing/paywall-gate";
import { DealerOfferCountdown } from "@/components/billing/dealer-offer-countdown";
import { ReadOnlyBanner } from "@/components/billing/read-only-banner";
import { ProtectedHeader } from "./protected-header";

interface ProtectedShellProps {
  profile: Profile | null;
  email: string;
  isAdmin?: boolean;
  isDealerStaff?: boolean;
  dealer?: Dealer | null;
  children: React.ReactNode;
}

export function ProtectedShell({
  profile,
  isAdmin = false,
  isDealerStaff = false,
  dealer = null,
  children,
}: ProtectedShellProps) {
  const state = profile ? getUserPlanState(profile) : null;
  const effectiveAccess = !!state?.hasAccess || isAdmin;
  const isReadOnly = !!state?.isReadOnly && !isAdmin;

  const showDealerCountdown =
    state?.hasAccess &&
    state.isDealerOffer &&
    state.dealerPremiumUntil != null;

  // Personnalisation partenaire : la couleur du concessionnaire remplace le doré.
  const brandHsl = hexToHslString(dealer?.primary_color);
  const brandStyle: CSSProperties | undefined = brandHsl
    ? ({ ["--primary"]: brandHsl, ["--ring"]: brandHsl } as CSSProperties)
    : undefined;

  return (
    <div className="app-surface min-h-dvh" style={brandStyle}>
      <ProtectedHeader
        isPremium={state?.effectivePlan === "premium"}
        isDealerOffer={!!state?.isDealerOffer}
        hasAccess={effectiveAccess}
        dealerDaysLeft={state?.dealerDaysLeft ?? null}
        hasDealer={!!dealer}
        isDealerStaff={isDealerStaff}
        isAdmin={isAdmin}
        appLogoUrl={dealer?.app_logo_url ?? null}
      />
      <div className="header-spacer" aria-hidden />
      {isReadOnly ? <ReadOnlyBanner /> : null}
      {showDealerCountdown ? (
        <DealerOfferCountdown
          expiresAt={state!.dealerPremiumUntil!.toISOString()}
          variant="banner"
        />
      ) : null}
      <main className="container py-6">
        <PaywallGate
          hasAccess={!!state?.hasAccess}
          isAdmin={isAdmin}
          isReadOnly={isReadOnly}
        >
          {children}
        </PaywallGate>
      </main>
    </div>
  );
}
