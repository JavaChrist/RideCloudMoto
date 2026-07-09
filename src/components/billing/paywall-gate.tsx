"use client";

import { usePathname } from "next/navigation";
import { AccessRequiredPanel } from "@/components/billing/access-required-panel";

interface PaywallGateProps {
  hasAccess: boolean;
  isAdmin?: boolean;
  /** Lecture seule : l'accès a expiré mais l'historique reste consultable. */
  isReadOnly?: boolean;
  children: React.ReactNode;
}

const EXEMPT_PREFIXES = ["/parametres", "/tarifs", "/admin", "/mon-concessionnaire"];

export function PaywallGate({
  hasAccess,
  isAdmin = false,
  isReadOnly = false,
  children,
}: PaywallGateProps) {
  const pathname = usePathname();

  if (
    hasAccess ||
    isAdmin ||
    isReadOnly ||
    EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return children;
  }

  return <AccessRequiredPanel />;
}
