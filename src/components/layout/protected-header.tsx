"use client";

import Link from "next/link";
import { Settings, Store, TriangleAlert } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProtectedHeaderProps {
  hasAccess: boolean;
  isPremium: boolean;
  isDealerOffer: boolean;
  dealerDaysLeft?: number | null;
  hasDealer?: boolean;
}

export function ProtectedHeader({
  hasAccess,
  isPremium,
  isDealerOffer,
  dealerDaysLeft,
  hasDealer = false,
}: ProtectedHeaderProps) {
  return (
    <header className="safe-area-top safe-area-x fixed inset-x-0 top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-14 min-h-[var(--header-bar-height)] items-center justify-between gap-2 sm:h-16 sm:gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Logo size={32} compactOnMobile />
          {hasAccess && isDealerOffer ? (
            <Badge variant="warning" className="hidden shrink-0 sm:inline-flex">
              Offert
              {dealerDaysLeft != null ? ` · ${dealerDaysLeft} j` : ""}
            </Badge>
          ) : hasAccess && isPremium ? (
            <Badge className="hidden shrink-0 sm:inline-flex">Premium</Badge>
          ) : null}
        </div>
        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Link
            href="/sos"
            aria-label="SOS entraide motard"
            className="mr-0.5 inline-flex h-9 items-center gap-1.5 rounded-full bg-red-600 px-3 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 sm:h-10 sm:px-4 sm:text-sm"
          >
            <TriangleAlert className="h-4 w-4" />
            SOS
          </Link>
          <ThemeToggle />
          {hasDealer ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10"
              asChild
              aria-label="Mon concessionnaire"
            >
              <Link href="/mon-concessionnaire">
                <Store className="h-5 w-5" />
              </Link>
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10" asChild aria-label="Paramètres">
            <Link href="/parametres">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
          <SignOutButton iconOnly className="h-9 w-9 sm:hidden" />
          <SignOutButton className="hidden sm:inline-flex" />
        </nav>
      </div>
    </header>
  );
}
