import type { Metadata } from "next";
import { getPublicSiteUrl } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
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

  // Résout le concessionnaire (nom + logo) à partir du code d'activation.
  let dealerName = dealer?.trim() || null;
  let dealerLogoUrl: string | null = null;
  try {
    const admin = createAdminClient();
    const { data: codeRow } = await admin
      .from("dealer_activation_codes")
      .select("dealer_id, dealer_name")
      .eq("code", normalized)
      .maybeSingle();

    if (codeRow?.dealer_id) {
      const { data: dealerRow } = await admin
        .from("dealers")
        .select("name, logo_url")
        .eq("id", codeRow.dealer_id)
        .maybeSingle();
      if (dealerRow) {
        dealerName = dealerRow.name ?? dealerName;
        dealerLogoUrl = dealerRow.logo_url ?? null;
      }
    } else if (!dealerName && codeRow?.dealer_name) {
      dealerName = codeRow.dealer_name;
    }
  } catch {
    // non bloquant : on garde le nom fourni en paramètre
  }

  return (
    <DealerFlyerPrint
      code={normalized}
      dealerName={dealerName}
      dealerLogoUrl={dealerLogoUrl}
      siteUrl={getPublicSiteUrl()}
    />
  );
}
