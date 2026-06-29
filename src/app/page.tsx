import Link from "next/link";
import Image from "next/image";
import { Bike, Bell, FileText, Wrench, ShieldCheck, Gift } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";

export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: Wrench, title: "Plan d'entretien", text: "Échéances d'entretien calculées selon votre modèle et votre usage." },
  { icon: Bell, title: "Rappels intelligents", text: "Notifications push avant chaque opération à prévoir." },
  { icon: FileText, title: "Fiches techniques", text: "Caractéristiques et notices de votre moto ou scooter à portée de main." },
  { icon: ShieldCheck, title: "Historique fiable", text: "Conservez factures, entretiens et accessoires au même endroit." },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-dvh">
      <header className="safe-area-top safe-area-x sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 min-h-[var(--header-bar-height)] items-center justify-between sm:h-16">
          <Logo href="/" />
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tarifs">Tarifs</Link>
            </Button>
            {user ? (
              <Button size="sm" asChild>
                <Link href="/categories">Mon garage</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Commencer</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/15 via-background to-background" />
          <div className="container grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium">
                <Gift className="h-3.5 w-3.5 text-primary" />
                12 mois Premium offerts à l&apos;inscription
              </span>
              <h1 className="text-balance text-4xl font-extrabold tracking-tight md:text-5xl">
                Le carnet d&apos;entretien intelligent de votre{" "}
                <span className="text-primary">deux-roues</span>
              </h1>
              <p className="text-balance text-lg text-muted-foreground">
                Suivez l&apos;entretien, l&apos;historique et les rappels de votre moto ou
                scooter. Simple, fiable, toujours dans votre poche.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href={user ? "/categories" : "/register"}>
                    <Bike className="h-5 w-5" />
                    {user ? "Accéder à mon garage" : "Créer mon compte gratuit"}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/tarifs">Voir les tarifs</Link>
                </Button>
              </div>
            </div>
            <div className="relative mx-auto aspect-square w-full max-w-sm">
              <Image src="/logo512.png" alt="RideCloudMoto" fill priority className="object-contain drop-shadow-2xl" />
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="container grid gap-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-5">
                <f.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-sm text-muted-foreground sm:flex-row">
          <Logo href="/" showWordmark size={28} />
          <nav className="flex gap-4">
            <Link href="/cgu" className="hover:underline">CGU</Link>
            <Link href="/confidentialite" className="hover:underline">Confidentialité</Link>
            <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
            <Link href="/rgpd" className="hover:underline">RGPD</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
