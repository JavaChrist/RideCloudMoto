"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
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
}

export function ProtectedHeader({
  hasAccess,
  isPremium,
  isDealerOffer,
  dealerDaysLeft,
}: ProtectedHeaderProps) {
  return (
    <header className="safe-area-top safe-area-x fixed inset-x-0 top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-3">
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
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10" asChild aria-label="Paramètres">
            <Link href="/parametres">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
          <SignOutButton className="hidden sm:inline-flex" />
        </nav>
      </div>
    </header>
  );
}
