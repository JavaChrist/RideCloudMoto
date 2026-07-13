import type { Metadata } from "next";
import { CatalogManager } from "@/components/admin/catalog-manager";

export const metadata: Metadata = { title: "Admin — Catalogue" };
export const dynamic = "force-dynamic";

export default function AdminCataloguePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <CatalogManager />
    </div>
  );
}
