import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { SosClient } from "@/components/sos/sos-client";

export const metadata: Metadata = { title: "SOS entraide motard" };
export const dynamic = "force-dynamic";

export default function SosPage() {
  return (
    <div className="container max-w-2xl space-y-4 py-4">
      <Suspense
        fallback={
          <p className="py-10 text-center text-sm text-muted-foreground">Chargement…</p>
        }
      >
        <SosClient />
      </Suspense>

      <Link
        href="/entraide"
        className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-accent"
      >
        <BookOpen className="h-5 w-5 text-primary" />
        <span className="text-sm">
          <span className="block font-medium">Culture & entraide motard</span>
          <span className="text-muted-foreground">
            Règles d&apos;or, signaux de la route et le salut en V
          </span>
        </span>
      </Link>
    </div>
  );
}
