import Link from "next/link";
import { Logo } from "@/components/common/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="mb-8">
        <Logo href="/" size={48} />
      </div>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link href="/cgu" className="hover:underline">
          CGU
        </Link>{" "}
        ·{" "}
        <Link href="/confidentialite" className="hover:underline">
          Confidentialité
        </Link>{" "}
        ·{" "}
        <Link href="/mentions-legales" className="hover:underline">
          Mentions légales
        </Link>
      </p>
    </div>
  );
}
