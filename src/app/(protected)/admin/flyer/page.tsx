import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/supabase/env";
import { DealerFlyerPrint } from "@/components/admin/dealer-flyer-print";

export const metadata: Metadata = { title: "Flyer concessionnaire" };
export const dynamic = "force-dynamic";

interface AdminFlyerPageProps {
  searchParams: Promise<{ code?: string; dealer?: string }>;
}

export default async function AdminFlyerPage({ searchParams }: AdminFlyerPageProps) {
  const { code, dealer } = await searchParams;
  const normalized = code?.trim().toUpperCase();

  if (!normalized || normalized.length < 6) {
    return (
      <div className="container py-12 text-center text-muted-foreground">
        Code manquant ou invalide. Ouvrez cette page depuis l&apos;admin avec un code valide.
      </div>
    );
  }

  return (
    <DealerFlyerPrint
      code={normalized}
      dealerName={dealer?.trim() || null}
      siteUrl={getSiteUrl()}
    />
  );
}
