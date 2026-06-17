import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo href="/" size={48} />
      <div>
        <p className="text-6xl font-extrabold text-primary">404</p>
        <h1 className="mt-2 text-xl font-semibold">Page introuvable</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}
