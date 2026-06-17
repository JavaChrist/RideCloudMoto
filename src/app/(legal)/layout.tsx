import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
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
