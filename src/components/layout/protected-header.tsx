"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProtectedHeaderProps {
  isPremium: boolean;
  isDealerOffer: boolean;
}

export function ProtectedHeader({ isPremium, isDealerOffer }: ProtectedHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo />
          {isPremium ? (
            <Badge variant={isDealerOffer ? "warning" : "default"} className="hidden sm:inline-flex">
              {isDealerOffer ? "Premium offert" : "Premium"}
            </Badge>
          ) : null}
        </div>
        <nav className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild aria-label="Paramètres">
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
