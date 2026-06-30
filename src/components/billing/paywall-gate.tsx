"use client";

import { usePathname } from "next/navigation";
import { AccessRequiredPanel } from "@/components/billing/access-required-panel";

interface PaywallGateProps {
  hasAccess: boolean;
  isAdmin?: boolean;
  children: React.ReactNode;
}

const EXEMPT_PREFIXES = ["/parametres", "/tarifs", "/admin"];

export function PaywallGate({ hasAccess, isAdmin = false, children }: PaywallGateProps) {
  const pathname = usePathname();

  if (hasAccess || isAdmin || EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))) {
    return children;
  }

  return <AccessRequiredPanel />;
}
