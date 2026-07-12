"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, PlusCircle, Store } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DealerShellProps {
  dealerName: string;
  email: string;
  children: React.ReactNode;
}

const NAV = [
  { href: "/portail", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/portail/ventes/nouvelle", label: "Nouvelle vente", icon: PlusCircle },
  { href: "/portail/licences", label: "Licences", icon: ListChecks },
];

export function DealerShell({ dealerName, email, children }: DealerShellProps) {
  const pathname = usePathname();

  return (
    <div className="app-surface min-h-dvh">
      <header className="safe-area-top safe-area-x fixed inset-x-0 top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-14 min-h-[var(--header-bar-height)] items-center justify-between gap-2 sm:h-16 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Logo size={32} compactOnMobile href="/portail" />
            <Badge variant="secondary" className="hidden shrink-0 items-center gap-1 sm:inline-flex">
              <Store className="h-3 w-3" />
              Espace pro
            </Badge>
          </div>
          <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <ThemeToggle />
            <SignOutButton iconOnly className="h-9 w-9 sm:hidden" />
            <SignOutButton className="hidden sm:inline-flex" />
          </nav>
        </div>
      </header>
      <div className="header-spacer" aria-hidden />

      <div className="border-b bg-card/40">
        <div className="container flex items-center justify-between gap-4 py-2">
          <p className="truncate text-sm font-semibold">{dealerName}</p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{email}</p>
        </div>
        <div className="container">
          <nav className="flex gap-1 overflow-x-auto pb-2">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="container py-6">{children}</main>
    </div>
  );
}
