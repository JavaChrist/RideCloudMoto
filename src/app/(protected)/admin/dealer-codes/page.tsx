import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/supabase/env";
import { DealerCodesManager } from "@/components/admin/dealer-codes-manager";

export const metadata: Metadata = { title: "Admin — Codes concessionnaire" };
export const dynamic = "force-dynamic";

export default function AdminDealerCodesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <DealerCodesManager siteUrl={getSiteUrl()} />
    </div>
  );
}
