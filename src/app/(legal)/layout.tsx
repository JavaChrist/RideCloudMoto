import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="safe-area-top safe-area-x sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 min-h-[var(--header-bar-height)] items-center justify-between sm:h-16">
          <Logo href="/" />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Accueil
            </Link>
          </Button>
        </div>
      </header>
      <main className="container py-10">{children}</main>
    </div>
  );
}
